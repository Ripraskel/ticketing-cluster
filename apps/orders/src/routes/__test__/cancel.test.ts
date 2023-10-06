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

    let publishedData;
    // Override Publish mock to get hold of Data for later verification
    jest.spyOn(asyncApi.client, 'publish').mockImplementationOnce((subject, data, callback) => {  
        data ? publishedData = JSON.parse(data.toString()) : "";
        callback && callback(undefined, "GUID");
        return ""
    });

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

    expect(publishedData).toEqual(expect.objectContaining({ ticket: expect.objectContaining({id: ticket.id}) }));
    expect(asyncApi.client.publish).toBeCalledTimes(1);
    expect(asyncApi.client.publish).toBeCalledWith(Subjects.OrderCancelled, expect.any(String), expect.any(Function) );
});