import { createMongooseId } from "../../test/actions";
import { Order, OrderStatus } from "../order";
import { Ticket } from "../ticket";

it("Implements optimistic concurrency", async () => {
    const ticket = Ticket.build({
        id: createMongooseId(),
        version: 0,
        title: "bifsfs",
        price: 5,
    });
    
    const order = Order.build({
        status: OrderStatus.Created,
        expiresAt: new Date(),
        userId: "fssfs",
        ticket
    });

    await order.save();

    const firstInstance = await Order.findById(order.id);
    const secondInstance = await Order.findById(order.id);

    firstInstance?.set({expiresAt: new Date(0)});
    secondInstance?.set({expiresAt: new Date(10)});

    await firstInstance?.save();

    await expect(secondInstance?.save()).rejects.toThrowError();
});

it("Increments the version number when changes are made", async () => {
    const ticket = Ticket.build({
        id: createMongooseId(),
        version: 0,
        title: "bifsfs",
        price: 5,
    });
    
    const order = Order.build({
        status: OrderStatus.Created,
        expiresAt: new Date(),
        userId: "fssfs",
        ticket
    });

    expect.assertions(2);
    await order.save();
    expect(order.version).toEqual(0);

    order.set({status: OrderStatus.AwaitingPayment});
    await order.save();
    expect(order.version).toEqual(1);
})