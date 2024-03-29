import express, { NextFunction, Request, Response } from 'express';
import { NotAuthorisedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@ticketing/common';
import { param } from 'express-validator';
import { Order } from '../models/order';
import { asyncApi } from '../asyncApi';
import { OrderCancelledPublisher } from '../events/order.publishers';

const router = express.Router();

router.patch('/api/orders/cancel/:orderId', requireAuth,
    [
        param('orderId').isMongoId().withMessage('Id must be valid'),
    ], 
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId } = req.params;

            const order = await Order.findById(orderId).populate('ticket');

            if (!order) {
                throw new NotFoundError();
            }

            if (order.userId !== req.currentUser!.id) {
                throw new NotAuthorisedError();
            }

            order.status = OrderStatus.Cancelled;

            await order.save();

            await new OrderCancelledPublisher(asyncApi.client).publish({
                id: order.id,
                version: order.version,
                ticket: {
                    id: order.ticket.id
                }
            });

            res.status(200).send(order);
        } catch(err) {
            next(err);
        }
    }
);

export { router as CancelOrderRouter}