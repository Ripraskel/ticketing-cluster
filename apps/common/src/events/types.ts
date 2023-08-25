import { Subjects } from "./subjects";
import { OrderStatus } from "./types/order-status";

export interface Event {
    subject: Subjects,
    data: any
}

export interface TicketCreatedEvent {
    subject: Subjects.TicketCreated,
    data: {
        id: string,
        title: string,
        price: number,
        userId: string
    }
};

export interface TicketUpdatedEvent {
    subject: Subjects.TicketUpdated,
    data: {
        id: string,
        title: string,
        price: number,
        userId: string
    }
}

export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated,
    data: {
        id: string,
        userId: string,
        status: OrderStatus,
        expiresAt: Date,
        ticketId: string
    }
};

export interface OrderUpdatedEvent {
    subject: Subjects.OrderUpdated,
    data: {
        id: string,
        userId: string,
        status: OrderStatus,
        expiresAt: Date,
        ticketId: string
    }
};