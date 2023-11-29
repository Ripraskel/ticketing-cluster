import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import { BadRequestError, NotAuthorisedError, NotFoundError, requireAuth, validateRequest } from '@ticketing/common';
import { Order, OrderStatus } from "../models/order";
import { asyncApi } from '../asyncApi';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/payment.publisher';

const router = express.Router();

router.post('/api/payments/complete', requireAuth, [
    body('paymentId').isMongoId().withMessage('paymentId must be valid'),
], validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { paymentId } = req.body;

            // Find the payment intent in the database
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new NotFoundError();
            }
            // Find order associated with the payment intent. This should never fail.
            const order = await Order.findById(payment.orderId);

            if (order?.userId !== req.currentUser!.id) {
                throw new NotAuthorisedError();
            }

            // confirm with Stripe that payment is complete
            // ideally would set up webhook with Stripe for this but that would require a public domain.
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripeId)
            
            // As no garantees due async nature only log if we could confirm for now
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log(paymentIntent.status)
            } else {
                // Let the order expiration handle failures
                console.log(paymentIntent.status)
            }

            // update payment record and publish event regardless payment intent status
            payment.complete = true;
            await payment.save();
            await new PaymentCreatedPublisher(asyncApi.client).publish({
                id: payment.id,
                orderId: payment.orderId,
                stripeId: payment.stripeId
            });

            res.send({
                orderId: order.id,
                amount: paymentIntent.amount,
                status: paymentIntent.status
            });
        } catch (err) {
            next(err);
        }
    });

export { router as PaymentCompleteRouter }