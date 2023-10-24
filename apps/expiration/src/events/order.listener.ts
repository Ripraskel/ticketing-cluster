import { Listener, Subjects, OrderCreatedEvent } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../queues/order.expirationQueue";

const queueGroupName = 'expiration-service';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const { id, expiresAt } = data;

        const delay =  new Date(expiresAt).getTime() - new Date().getTime();

        await expirationQueue.add({ orderId: id }, { delay });
        
        msg.ack();
    }
};