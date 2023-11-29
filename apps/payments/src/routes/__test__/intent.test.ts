import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createOrder, getAuthCookie } from "../../test/actions";
import { OrderStatus, Subjects } from "@ticketing/common";
import { stripe } from "../../stripe";
import Stripe from "stripe";
import { Payment } from "../../models/payment";
import { asyncApi } from "../../asyncApi";

it("Returns a 401 when the user is not authenticated", async () => {
    const response = await request(app)
        .post('/api/payments/intent')
        .send();

    expect(response.status).toEqual(401);
});

describe("Returns validation error if incorrect data supplied", () => {
    it.each([
        ["Missing orderId", undefined],
        ["Invalid orderId", "fsffsfs"],
    ])("%s", async (testname, orderId) => {
        const response = await request(app)
            .post('/api/payments/intent')
            .set('Cookie', getAuthCookie())
            .send({
                orderId
            });

        expect(response.status).toEqual(400);
    });
});

it("Returns a 404 if order does not exist", async () => {
    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie())
        .send({
            token: "fsffs",
            orderId: createMongooseId()
        });

    expect(response.status).toEqual(404);
});

it("Returns a 401 when user is attempting to purchase an order that doesn't belong to them", async () => {
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie())
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(401);
});

it("Returns a 400 when the order already cancelled", async () => {
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    order.set({ status: OrderStatus.Cancelled });
    order.save();

    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(400);

});

it("Returns a 201 with stripe client_secret when payment intent is successful", async () => {
    const dummyStripeChargeId = "fnsilfnsvnsponcscins";
    const clientSecret = "fwoisinvfaugbvnaelinf";
    jest.spyOn(stripe.paymentIntents, 'create')
        .mockResolvedValueOnce({ id: dummyStripeChargeId, client_secret: clientSecret } as unknown as Stripe.Response<Stripe.PaymentIntent>)
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(201);
    expect(response.body.clientSecret).toEqual(clientSecret);
});

it("Returns a 500 if stripe encounters an issue", async () => {
    jest.spyOn(stripe.paymentIntents, 'create').mockImplementationOnce(() => { throw new Error("Stripe Error") })
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(500);
});

it("Saves payment intent record", async () => {
    const dummyStripeChargeId = "fnsilfnsvnsponcscins";
    jest.spyOn(stripe.paymentIntents, 'create')
        .mockResolvedValueOnce({ id: dummyStripeChargeId, client_secret: "1234" } as unknown as Stripe.Response<Stripe.PaymentIntent>)
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments/intent')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect.assertions(1);
    
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: dummyStripeChargeId
    });

    expect(payment).not.toBeNull();
});