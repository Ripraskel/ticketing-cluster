import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createTicket, getAuthCookie } from "../../test/actions";
import { Ticket } from "../../models/ticket";
import { asyncApi } from "../../asyncApi";

it('returns 404 if ticket id does not exist', async () => {
    const id = createMongooseId();
    const userId = '1234';
    
    const response = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', getAuthCookie(userId))
    .send({
        title: 'Ticket',
        price: 20,
        userId
    });

    expect(response.status).toEqual(404);
});

it('returns 401 if user is not authenticated', async () => {
    const id = createMongooseId();
    
    const response = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
        title: 'Ticket',
        price: 20,
    });

    expect(response.status).toEqual(401);
});

it('returns 401 if user does not own the ticket', async () => {
    const userId = createMongooseId();
    const ticket = await createTicket({
        title: 'Ticket',
        price: 20,
        userId: createMongooseId() // Different from userId
    })
    
    const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', getAuthCookie(userId))
    .send({
        title: 'New Ticket Title',
        price: 10,
    });

    expect(response.status).toEqual(401);
});

describe('returns a 400 if an invalid body is provided', () => {

    it.each([
        ['Empty title', { title: '', price: 10 }],
        ['Title is missing', { price: 10 }],
        ['Negative price', { title: 'Ticket', price: -10 }],
        ['Price is missing', { title: 'Ticket' }]
    ])('%s', async (invalid, body) => {
        const userId = '1234';
        const ticket = await createTicket({
            title: 'Ticket',
            price: 20,
            userId
        });

        const response = await request(app)
        .put(`/api/tickets/${ticket.id}`)
        .set('Cookie', getAuthCookie(userId))
        .send(body)
    
        expect(response.status).toEqual(400);
    })
});

it('returns 400 when ticket id is not valid', async () => {
    const response = await request(app)
        .put('/api/tickets/1234')
        .set('Cookie', getAuthCookie())
        .send({
            title: 'Ticket',
            price: 20,
        });

    expect(response.status).toEqual(400);
});

it('returns 400 if the ticket is reserved', async () => {
    const ticket = await createTicket({
        title: 'Ticket',
        price: 20,
        userId: createMongooseId() // Different from userId
    })
    ticket.set({ orderId: createMongooseId() })
    await ticket.save();
    
    const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', getAuthCookie(ticket.userId))
    .send({
        price: 10,
    });

    expect(response.status).toEqual(400);
});

it('successfully updates ticket when valid inputs provided', async () => {
    const userId = '1234';
    const ticket = await createTicket({
        title: 'Ticket',
        price: 20,
        userId
    })
    
    const newTicketDetails = {
        title: 'New Ticket Title',
        price: 10,
    }
    const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', getAuthCookie(userId))
    .send(newTicketDetails);

    // Check Database
    const tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(newTicketDetails.title);
    expect(tickets[0].price).toEqual(newTicketDetails.price);

    // Check Response
    expect(response.body.title).toEqual(newTicketDetails.title);
    expect(response.body.price).toEqual(newTicketDetails.price);
    expect(response.status).toEqual(201);
});

it('Publishes ticket updated event when successfully updated', async () => {
    const userId = '1234';
    const ticket = await createTicket({
        title: 'Ticket',
        price: 20,
        userId
    })
    
    const newTicketDetails = {
        title: 'New Ticket Title',
        price: 10,
    };

    const response = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', getAuthCookie(userId))
    .send(newTicketDetails);

    expect(asyncApi.client.publish).toBeCalledTimes(1);
});