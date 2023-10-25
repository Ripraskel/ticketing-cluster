import { Listener, OrderCancelledEvent, OrderCreatedEvent, OrderStatus, Subjects } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order";

const queueGroupName = 'payments-service';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const {id, status, userId, ticket, version } = data;

        const order = Order.build({
            id,
            userId,
            status,
            version,
            price: ticket.price
        });

        await order.save();

        msg.ack();
    }
};

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message): Promise<void> {
        const { id, version } = data;
        const order = await Order.findByEvent({id, version});

        if (!order) {
            throw new Error('Order not found');
        }

        // Version needs to be updated as Mongo won't do it if no other properties change.
        order.set({ status: OrderStatus.Cancelled, version });
        await order.save();

        msg.ack();
    }
};
