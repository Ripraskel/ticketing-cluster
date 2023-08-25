import express, { NextFunction, Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { param } from 'express-validator';
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import mongoose from 'mongoose';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth,
    [
        param('orderId').isMongoId().withMessage('Id must be valid')
    ], 
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.orderId;

            const order = await Order.findById(id).populate('ticket');
        
            if (!order) {
                throw new NotFoundError(); 
            }

            if (order.userId != req.currentUser!.id) {
                throw new NotAuthorisedError();
            }

            res.status(200).send(order);
        } catch(err) {
            next(err);
        }
    }
);

export { router as ShowOrderRouter}