import { Publisher, Subjects, TicketCreatedEvent, TicketUpdatedEvent } from "@ticketing/common/";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
};

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
};