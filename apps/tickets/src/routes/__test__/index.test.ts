import request from "supertest";
import { app } from "../../app";
import { createTicket } from "../../test/actions";

it('returns the tickets in the database', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app)
        .get('/api/tickets')
        .send();
    
    expect(response.body.length).toBe(3);
})