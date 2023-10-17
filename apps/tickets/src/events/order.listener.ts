import { Listener, Subjects, OrderCreatedEvent } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";

const queueGroupName = 'orders-service';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message): Promise<void> {
        const ticket = await Ticket.findById(data.ticket.id);
        
        if (!ticket) {
            throw new Error("Received order for non-existant ticket")
        }

        ticket.set({ orderId: data.id });
        ticket.save();

        msg.ack();
    }
};
