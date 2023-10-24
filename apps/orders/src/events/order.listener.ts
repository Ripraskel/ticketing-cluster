import { Listener, OrderExpiredEvent, OrderStatus, Subjects } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "./order.publishers";

const queueGroupName = 'orders-service';

export class OrderExpiredListener extends Listener<OrderExpiredEvent> {
    readonly subject = Subjects.OrderExpired;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderExpiredEvent['data'], msg: Message): Promise<void> {
        const order = await Order.findById(data.id).populate('ticket');

        if (!order) {
            throw new Error("Order not found");
        }

        order.set({status: OrderStatus.Cancelled});
        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }
}