import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Order, OrderStatus } from "../models/order";
import { stripe } from '../stripe';
import { Payment } from '../models/payment';

const router = express.Router();

router.post('/api/payments/intent', requireAuth, [
    body('orderId').isMongoId().withMessage('orderId must be valid'),
], validateRequest, 
async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderId } = req.body;

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

        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'gbp',
            amount: order.price * 100, // into pence,
            metadata: {
                orderId
            }
        });

        const payment = Payment.build({
            orderId: order.id,
            stripeId: paymentIntent.id,
            complete: false
        });
        await payment.save();
    
        res.status(201).send({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id
        });
    } catch (err) {
        next(err);
    }
});

export { router as PaymentIntentRouter}