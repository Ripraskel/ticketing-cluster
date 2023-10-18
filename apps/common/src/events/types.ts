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
        version: number
        title: string,
        price: number,
        userId: string
    }
};

export interface TicketUpdatedEvent {
    subject: Subjects.TicketUpdated,
    data: {
        id: string,
        version: number,
        title: string,
        price: number,
        userId: string,
        orderId?: string
    }
}

export interface OrderCreatedEvent {
    subject: Subjects.OrderCreated,
    data: {
        id: string,
        version: number,
        userId: string,
        status: OrderStatus,
        expiresAt: string,
        ticket: {
            id: string,
            price: number
        }
    }
};

export interface OrderCancelledEvent {
    subject: Subjects.OrderCancelled,
    data: {
        id: string,
        version: number,
        ticket: {
            id: string,
        }
    }
};