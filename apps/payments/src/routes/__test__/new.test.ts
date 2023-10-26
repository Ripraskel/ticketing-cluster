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
        .post('/api/payments')
        .send();

    expect(response.status).toEqual(401);
});

describe("Returns validation error if incorrect data supplied", () => {
    it.each([
        ["Missing token", , createMongooseId()],
        ["Missing orderId", "token", undefined],
        ["Invalid orderId", "token", "fsffsfs"],
    ])("%s", async (testname, token, orderId) => {
        const response = await request(app)
            .post('/api/payments')
            .set('Cookie', getAuthCookie())
            .send({
                token,
                orderId
            });

        expect(response.status).toEqual(400);
    });
});

it("Returns a 404 if order does not exist", async () => {
    const response = await request(app)
        .post('/api/payments')
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
        .post('/api/payments')
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
        .post('/api/payments')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(400);

});

it("Returns a 201 when the order purchase is successful", async () => {
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(201);
});

it("Returns a 500 if stripe encounters an issue", async () => {
    jest.spyOn(stripe.charges, 'create').mockImplementationOnce(() => { throw new Error("Stripe Error") })
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect(response.status).toEqual(500);
});

it("Saves payment record and publishes event on successful payment", async () => {
    const dummyStripeChargeId = "fnsilfnsvnsponcscins";
    jest.spyOn(stripe.charges, 'create')
        .mockResolvedValueOnce({ id: dummyStripeChargeId } as unknown as Stripe.Response<Stripe.Charge>)
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            token: "fsffs",
            orderId: order.id
        });

    expect.assertions(5);
    
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: dummyStripeChargeId
    });

    expect(payment).not.toBeNull();

    // Get arguments the publisher was called with
    const [eventSubject, paymentStringiFied, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;

    // Check the correct event was published
    expect(JSON.parse(paymentStringiFied).id).toEqual(payment?.id);
    expect(JSON.parse(paymentStringiFied).orderId).toEqual(order.id);
    expect(JSON.parse(paymentStringiFied).stripeId).toEqual(payment?.stripeId);
    expect(eventSubject).toEqual(Subjects.PaymentCreated);
});