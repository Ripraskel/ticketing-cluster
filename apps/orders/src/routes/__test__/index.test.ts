import request from "supertest";
import { app } from "../../app";
import { createMongooseId, createOrder, createTicket, getAuthCookie } from "../../test/actions";
import { OrderStatus } from "../../models/order";

it('returns the orders in the database for the authenticated user', async () => {
    const user1Id = createMongooseId();
    const user2Id = createMongooseId();

    const ticket1 = await createTicket();
    const ticket2 = await createTicket();
    const ticket3 = await createTicket();

    const user1Order1 = await createOrder({
        userId: user1Id,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket1
    });

    const user1Order2 = await createOrder({
        userId: user1Id,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket2
    });

    const user2Order1 = await createOrder({
        userId: user2Id,
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket: ticket3
    });
    
    const responseUser1 = await request(app)
    .get('/api/orders')
    .set('Cookie', getAuthCookie(user1Id))
    .send();

    const responseUser2 = await request(app)
    .get('/api/orders')
    .set('Cookie', getAuthCookie(user2Id))
    .send();
    
    expect(responseUser1.body.length).toBe(2);
    expect(responseUser2.body.length).toBe(1);
    expect(responseUser2.body[0].id).toEqual(user2Order1.id)
})