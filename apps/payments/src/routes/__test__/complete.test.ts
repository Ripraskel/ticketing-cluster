import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createOrder, createPayment, getAuthCookie } from "../../test/actions";
import { OrderStatus, Subjects } from "@ticketing/common";
import { stripe } from "../../stripe";
import Stripe from "stripe";
import { Payment } from "../../models/payment";
import { asyncApi } from "../../asyncApi";

it("Returns a 401 when the user is not authenticated", async () => {
    const response = await request(app)
        .post('/api/payments/complete')
        .send();

    expect(response.status).toEqual(401);
});

describe("Returns validation error if incorrect data supplied", () => {
    it.each([
        ["Missing paymentId", undefined],
        ["Invalid paymentId", "fsffsfs"],
    ])("%s", async (testname, paymentId) => {
        const response = await request(app)
            .post('/api/payments/complete')
            .set('Cookie', getAuthCookie())
            .send({
                paymentId
            });

        expect(response.status).toEqual(400);
    });
});

it("Returns a 404 if payment does not exist", async () => {
    const response = await request(app)
        .post('/api/payments/complete')
        .set('Cookie', getAuthCookie())
        .send({
            paymentId: createMongooseId()
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

    const payment = await createPayment({
        orderId: order.id,
        stripeId: "FAKE_STRIPE_ID",
        complete: false
    });

    const response = await request(app)
        .post('/api/payments/complete')
        .set('Cookie', getAuthCookie())
        .send({
            paymentId: payment.id
        });

    expect(response.status).toEqual(401);
});

it("Returns a 201 when payment is confirmed from stripe", async () => {
    const fakePaymentIntent = {
        id: "fnsilfnsvnsponcscins",
        amount: 1000,
        status: 'succeeded'
    }
    jest.spyOn(stripe.paymentIntents, 'retrieve')
        .mockResolvedValueOnce(fakePaymentIntent as unknown as Stripe.Response<Stripe.PaymentIntent>)
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const payment = await createPayment({
        orderId: order.id,
        stripeId: "FAKE_STRIPE_ID",
        complete: false
    });

    const response = await request(app)
        .post('/api/payments/complete')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            paymentId: payment.id
        });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
        orderId: order.id,
        amount: fakePaymentIntent.amount,
        status: fakePaymentIntent.status
    })
});

it("Returns a 500 if stripe encounters an issue getting payment intent", async () => {
    jest.spyOn(stripe.paymentIntents, 'retrieve').mockImplementationOnce(() => { throw new Error("Stripe Error") })
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const payment = await createPayment({
        orderId: order.id,
        stripeId: "FAKE_STRIPE_ID",
        complete: false
    });

    const response = await request(app)
        .post('/api/payments/complete')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            paymentId: payment.id
        });

    expect(response.status).toEqual(500);
});

it("Saves payment record as complete and publishes event", async () => {
    const fakePaymentIntent = {
        id: "fnsilfnsvnsponcscins",
        amount: 1000,
        status: 'succeeded'
    }
    jest.spyOn(stripe.paymentIntents, 'retrieve')
        .mockResolvedValueOnce(fakePaymentIntent as unknown as Stripe.Response<Stripe.PaymentIntent>)
    const order = await createOrder({
        id: createMongooseId(),
        userId: createMongooseId(),
        status: OrderStatus.Created,
        version: 0,
        price: 20
    });

    const payment = await createPayment({
        orderId: order.id,
        stripeId: fakePaymentIntent.id,
        complete: false
    });

    const response = await request(app)
        .post('/api/payments/complete')
        .set('Cookie', getAuthCookie(order.userId))
        .send({
            paymentId: payment.id
        });

    expect.assertions(6);
    
    const paymentUpdated = await Payment.findOne({
        orderId: order.id,
        stripeId: fakePaymentIntent.id
    });

    expect(paymentUpdated).not.toBeNull();
    expect(paymentUpdated?.complete).toBeTruthy();

    // Get arguments the publisher was called with
    const [eventSubject, paymentStringiFied, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;

    // Check the correct event was published
    expect(JSON.parse(paymentStringiFied).id).toEqual(payment?.id);
    expect(JSON.parse(paymentStringiFied).orderId).toEqual(order.id);
    expect(JSON.parse(paymentStringiFied).stripeId).toEqual(payment?.stripeId);
    expect(eventSubject).toEqual(Subjects.PaymentCreated);
});
