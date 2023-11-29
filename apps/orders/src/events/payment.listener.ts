import { Listener, Subjects, PaymentCreatedEvent, OrderStatus } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order";

const queueGroupName = 'orders-service';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message): Promise<void> {
        const { orderId } = data;

        console.log(orderId)
        const order = await Order.findById(orderId);

        if (!order) {
            throw new Error("Order not found for payment event");
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
};