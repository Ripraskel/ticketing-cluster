import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

// build Ticket interface 
interface BuildTicketParams {
    title: string
    price: number
};

// interface for Ticket from Mongoose
interface TicketDoc extends mongoose.Document, BuildTicketParams {
    isReserved(): Promise<boolean>
}

// Ticket Model interface
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: BuildTicketParams): TicketDoc
};

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret.__v;
            delete ret._id
        },
    }
});

TicketSchema.statics.build = (attrs: BuildTicketParams) => {
    return new Ticket(attrs);
}
TicketSchema.methods.isReserved = async function() {
    // this === to the ticket document that this function was called on
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);

export { Ticket, BuildTicketParams, TicketDoc };