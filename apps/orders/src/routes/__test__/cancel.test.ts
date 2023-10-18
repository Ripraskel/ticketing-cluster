import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createOrder, createTicket, getAuthCookie } from "../../test/actions";
import { OrderStatus } from "../../models/order";
import { asyncApi } from "../../asyncApi";
import { Subjects } from "@ticketing/common";

it('returns the cancelled order', async () => {
    const userId = createMongooseId();

    const ticket = await createTicket();

    const order = await createOrder({
        userId: userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    });

    const response = await request(app)
    .patch(`/api/orders/cancel/${order.id}`)
    .set('Cookie', getAuthCookie(userId))
    .send();
    
    expect(response.status).toEqual(200);
    expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it('returns an error if the user does not own the order', async () => {
    const otherUserId = createMongooseId();

    const ticket = await createTicket();

    const order = await createOrder({
        userId: otherUserId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    });

    const response = await request(app)
    .patch(`/api/orders/cancel/${order.id}`)
    .set('Cookie', getAuthCookie())
    .send();
    
    expect(response.status).toEqual(401);
});

it('publishes an event when order is cancelled', async () => {
    const userId = createMongooseId();

    const ticket = await createTicket();

    const order = await createOrder({
        userId: userId,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket
    });

    const response = await request(app)
    .patch(`/api/orders/cancel/${order.id}`)
    .set('Cookie', getAuthCookie(userId))
    .send();
    
    expect(response.status).toEqual(200);

    // Get arguments the publisher was called with
    const [eventSubject, orderStringified, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;

    // Check the correct event was published
    expect(JSON.parse(orderStringified).id).toEqual(response.body.id);
    expect(JSON.parse(orderStringified).ticket.id).toEqual(ticket.id);
    expect(eventSubject).toEqual(Subjects.OrderCancelled);
});