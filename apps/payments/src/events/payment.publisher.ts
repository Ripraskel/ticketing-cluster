import { Publisher, Subjects, PaymentCreatedEvent } from "@ticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
};