import express, { NextFunction, Request, Response } from 'express';
import { Order } from '../models/order';
import { requireAuth } from '@ticketing/common';

const router = express.Router();

router.get('/api/orders', requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orders = await Order.find({
                userId: req.currentUser!.id
            }).populate('ticket');

            res.status(200).send(orders);
        } catch(err) {
            next(err);
        }
    }
);

export { router as IndexOrderRouter}