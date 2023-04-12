import jwt from "jsonwebtoken";
import { BuildTicketParams, Ticket, TicketDoc } from "../models/ticket";
import mongoose from "mongoose";

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
    title: 'Title',
    price: 10,
    userId: '1234'
}): Promise<TicketDoc> => {
    const newTicket = Ticket.build(ticket);
    return newTicket.save();
}

const createMongooseId = () => {
    return new mongoose.Types.ObjectId().toHexString();
}

export {
    createMongooseId,
    createTicket,
    getAuthCookie,
}