import { Listener, Subjects, TicketCreatedEvent, TicketUpdatedEvent } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";

const queueGroupName = 'orders-service';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message): Promise<void> {
        const { id, title, price, version } = data;

        const ticket = Ticket.build({
            id,
            title,
            price,
            version
        });
        await ticket.save();

        msg.ack();
    }
};

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message): Promise<void> {
        const { id, title, price, version } = data;

        const ticket = await Ticket.findByEvent({ id, version });

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Version needs to be updated as Mongo won't do it if no other properties change.
        ticket.set({ title, price, version });
        await ticket.save();

        msg.ack();
    }
};