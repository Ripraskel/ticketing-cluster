import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { BuildOrderParams, Order, OrderDoc, OrderStatus } from "../models/order";
import { BuildPaymentParams, Payment, PaymentDoc } from "../models/payment";

const getAuthCookie = (id: string = '1234', email: string = 'test@test.com') => {
    const payload = {
        id,
        email
    };

    const token = jwt.sign(payload, process.env.JWT_KEY!);

    const session = { jwt: token };

    const sessionJSON = JSON.stringify(session);

    const base64 = Buffer.from(sessionJSON).toString('base64');

    return `session=${base64}`
}


const createOrder = async (order: BuildOrderParams): Promise<OrderDoc> => {
    const newOrder = Order.build(order);
    return newOrder.save();
}

const createPayment = async (payment: BuildPaymentParams): Promise<PaymentDoc> => {
    const newPayment = Payment.build(payment);
    return newPayment.save();
}

const createMongooseId = () => {
    return new mongoose.Types.ObjectId().toHexString();
}

export {
    createOrder,
    createMongooseId,
    createPayment,
    getAuthCookie,
}