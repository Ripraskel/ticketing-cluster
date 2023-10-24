import { Publisher, Subjects, OrderExpiredEvent } from "@ticketing/common";

export class OrderExpiredPublisher extends Publisher<OrderExpiredEvent> {
    readonly subject = Subjects.OrderExpired;
};
