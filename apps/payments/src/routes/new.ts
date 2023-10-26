import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Order, OrderStatus } from "../models/order";
import { asyncApi } from '../asyncApi';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/payment.publisher';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('token').not().isEmpty().withMessage('token is required'),
    body('orderId').isMongoId().withMessage('orderId must be valid'),
], validateRequest, 
async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, orderId } = req.body;

        // Find the order the user is trying to order in the database
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorisedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError("Can't pay for cancelled order")
        }

        const stripeCharge = await stripe.charges.create({
            currency: "gbp",
            amount: order.price * 100, // into pence
            source: token
        });

        const payment = Payment.build({
            orderId: order.id,
            stripeId: stripeCharge.id
        });
        await payment.save();

        await new PaymentCreatedPublisher(asyncApi.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });
    
        res.status(201).send();
    } catch (err) {
        next(err);
    }
});

export { router as CreateChargeRouter}