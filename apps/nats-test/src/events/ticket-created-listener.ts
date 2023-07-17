import { Message } from "node-nats-streaming";
import { Listener } from "./abstract-listener";
import { TicketCreatedEvent } from "./event-types";
import { Subjects } from "./subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        console.log('Event data!', data);
        
        msg.ack();
    }
}