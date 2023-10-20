import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from "../models/order";
import { OrderCreatedPublisher } from '../events/order.publishers';
import { asyncApi } from '../asyncApi';

const router = express.Router();

// Could move to env variable or db at a later date.
const EXPIRATION_WINDOW_SECONDS: number = 60; // 15 minutes in seconds

router.post('/api/orders', requireAuth, [
    body('ticketId').not().isEmpty().withMessage('Ticket ID is required'),
], validateRequest, 
async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ticketId } = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }

        // Make sure this ticket is not already reserved
        if (await ticket.isReserved()) {
            throw new BadRequestError('Ticket is not available to purchase')
        }

        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });

        await order.save();

        await new OrderCreatedPublisher(asyncApi.client).publish({
            id: order.id,
            version: order.version,
            userId: order.userId,
            status: order.status,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: order.ticket.id,
                price: order.ticket.price
            }
        });
    
        res.status(201).send(order);
    } catch (err) {
        next(err);
    }
});

export { router as CreateOrderRouter}