import { Message } from "node-nats-streaming";
import { Publisher } from "./abstract-publisher";
import { TicketCreatedEvent } from "./event-types";
import { Subjects } from "./subjects";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}