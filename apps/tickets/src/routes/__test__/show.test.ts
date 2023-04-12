import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createTicket, getAuthCookie } from "../../test/actions";

it('returns 400 when ticket id is not valid', async () => {
    const response = await request(app)
        .get('/api/tickets/1234')
        .set('Cookie', getAuthCookie())
        .send();

    expect(response.status).toEqual(400);
});

it('returns 404 when ticket does not exist', async () => {
    const id = createMongooseId();

    const response = await request(app)
        .get(`/api/tickets/${id}`)
        .set('Cookie', getAuthCookie())
        .send();

    expect(response.status).toEqual(404);
});


it('returns the ticket if the ticket is found', async () => {
    const newTicket = await createTicket();

    const response = await request(app)
    .get(`/api/tickets/${newTicket.id}`)
    .set('Cookie', getAuthCookie())
    .send();

    expect(response.status).toEqual(200);
    expect(response.body.title).toEqual(newTicket.title);
    expect(response.body.price).toEqual(newTicket.price);
});