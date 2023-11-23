import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Order, OrderStatus } from "../models/order";
import { asyncApi } from '../asyncApi';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/payment.publisher';

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
            console.log("Order is cancelled")
            throw new BadRequestError("Can't pay for cancelled order")
        }

        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'gbp',
            amount: order.price * 100, // into pence,
            metadata: {
                orderId
            }
        });

        console.log("intent", paymentIntent)

        const payment = Payment.build({
            orderId: order.id,
            stripeId: paymentIntent.id,
            complete: false
        });
        await payment.save();

        console.log("paymentId", payment.id)
    
        res.status(201).send({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id
        });
    } catch (err) {
        console.log("Error caught on intent APi")
        next(err);
    }
});

export { router as PaymentIntentRouter}