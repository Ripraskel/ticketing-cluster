import jwt from "jsonwebtoken";
import { BuildTicketParams, Ticket, TicketDoc } from "../models/ticket";
import mongoose from "mongoose";
import { BuildOrderParams, Order, OrderDoc, OrderStatus } from "../models/order";

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

const createTicket = async (ticket: BuildTicketParams = {
    id: createMongooseId(),
    title: 'Title',
    price: 10,
    version: 0
}): Promise<TicketDoc> => {
    const newTicket = Ticket.build(ticket);
    return newTicket.save();
}

const createOrder = async (order: BuildOrderParams): Promise<OrderDoc> => {
    const newOrder = Order.build(order);
    return newOrder.save();
}

const createMongooseId = () => {
    return new mongoose.Types.ObjectId().toHexString();
}

export {
    createOrder,
    createMongooseId,
    createTicket,
    getAuthCookie,
}