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
            console.log("paymentId complete", paymentId )

            // Find the order the user is trying to order in the database
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new NotFoundError();
            }
            const order = await Order.findById(payment.orderId);

            if (!order) {
                throw new NotFoundError();
            }
            if (order.userId !== req.currentUser!.id) {
                throw new NotAuthorisedError();
            }
            if (order.status === OrderStatus.Cancelled) {
                throw new BadRequestError("Can't pay for cancelled order")
            }

            // confirm with Stripe that payment is complete
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripeId)
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log(paymentIntent.status)
                payment.complete = true;
                await payment.save();

                await new PaymentCreatedPublisher(asyncApi.client).publish({
                    id: payment.id,
                    orderId: payment.orderId,
                    stripeId: payment.stripeId
                });
            } else {
                // Let the order expiration handle failures
                // ideally would set up webhook with Stripe for this but that would require a public domain.
                console.log(paymentIntent.status)
            }

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