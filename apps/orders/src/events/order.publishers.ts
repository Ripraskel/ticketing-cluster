import { Publisher, Subjects, OrderCreatedEvent, OrderUpdatedEvent } from "@ticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
};

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
    readonly subject = Subjects.OrderUpdated;
};