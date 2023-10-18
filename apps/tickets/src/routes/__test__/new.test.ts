import request from "supertest";
import { app } from "../../app";
import { getAuthCookie } from "../../test/actions";
import { Ticket } from "../../models/ticket";
import { asyncApi } from "../../asyncApi";

it('has route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .send({});

    expect(response.status).toEqual(401);
})

it('does NOT return 401 when user is authenticated', async () => {
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send({});

    expect(response.status).not.toEqual(401);
})

describe('returns an error if an invalid body is provided', () => {

    it.each([
        ['Empty title', { title: '', price: 10 }],
        ['Title is missing', { price: 10 }],
        ['Negative price', { title: 'Ticket', price: -10 }],
        ['Price is missing', { title: 'Ticket' }]
    ])('%s', async (invalid, body) => {
        const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', getAuthCookie())
        .send(body)
    
        expect(response.status).toEqual(400);
    })
})


it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const body = {
        title: "Ticket",
        price: 20
    };

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send(body)

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(body.title);
    expect(tickets[0].price).toEqual(body.price);

    expect(response.status).toEqual(201);
});

it('publishes an event when ticket is created', async () => {

    const body = {
        title: "Ticket",
        price: 20
    };

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', getAuthCookie())
    .send(body)

    expect(asyncApi.client.publish).toBeCalledTimes(1);
});
