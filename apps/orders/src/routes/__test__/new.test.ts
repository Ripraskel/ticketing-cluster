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
        title: 'Ticket',
        price: 20,
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
        title: 'Ticket',
        price: 20,
    });
    
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id });

    expect(response.status).toEqual(201)
})

it('publishes an event when order is reserved', async () => {
    const ticket = await createTicket({
        title: 'Ticket',
        price: 20,
    });

    let publishedData;
    // Override Publish mock to get hold of Data for later verification
    jest.spyOn(asyncApi.client, 'publish').mockImplementationOnce((subject, data, callback) => {  
        data ? publishedData = JSON.parse(data.toString()) : "";
        callback && callback(undefined, "GUID");
        return ""
    });

    const response = await request(app)
    .post('/api/orders')
    .set('Cookie', getAuthCookie())
    .send({ ticketId: ticket.id });

    expect(response.status).toEqual(201)

    expect(publishedData).toEqual(expect.objectContaining({ ticket: expect.objectContaining({id: ticket.id}) }));
    expect(asyncApi.client.publish).toBeCalledTimes(1);
    expect(asyncApi.client.publish).toBeCalledWith(Subjects.OrderCreated, expect.any(String), expect.any(Function) );
});
