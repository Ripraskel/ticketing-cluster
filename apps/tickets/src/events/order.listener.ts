import { Listener, Subjects, OrderCreatedEvent } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "./ticket.publishers";

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
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
        });

        msg.ack();
    }
};
