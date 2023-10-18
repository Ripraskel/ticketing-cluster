import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createOrder, createTicket, getAuthCookie } from "../../test/actions";
import { OrderStatus } from "../../models/order";
import { asyncApi } from "../../asyncApi";
import { Subjects } from "@ticketing/common";

it('has route handler listening to /api/orders for post requests', async () => {
    const response = await request(app)
        .post('/api/orders')
        .send({});

    expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/orders')
    .send({});

    expect(response.status).toEqual(401);
})

it('does NOT return 401 when user is authenticated', async () => {
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({});

    expect(response.status).not.toEqual(401);
})


it('returns an error if the ticket does not exist', async () => {
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: createMongooseId() });

    expect(response.status).toEqual(404)
})

it('returns an error if the ticket is already reserved', async () => {
    const ticket = await createTicket({
        id: createMongooseId(),
        title: 'Ticket',
        price: 20,
        version: 0
    });

    const existingOrder = await createOrder({
        userId: createMongooseId(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id });

    expect(response.status).toEqual(400)
})

it('reserves a ticket', async () => {
    const ticket = await createTicket({
        id: createMongooseId(),
        title: 'Ticket',
        price: 20,
        version: 0
    });
    
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id });

    expect(response.status).toEqual(201)
})

it('publishes an event when order is reserved', async () => {
    const ticket = await createTicket({
        id: createMongooseId(),
        title: 'Ticket',
        price: 20,
        version: 0
    });

    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id });

    expect.assertions(4);
    expect(response.status).toEqual(201)

    // Get arguments the publisher was called with
    const [eventSubject, orderStringiFied, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;
    
    // Check the correct event was published
    expect(JSON.parse(orderStringiFied).id).toEqual(response.body.id);
    expect(JSON.parse(orderStringiFied).ticket.id).toEqual(ticket.id);
    expect(eventSubject).toEqual(Subjects.OrderCreated);
    
});
