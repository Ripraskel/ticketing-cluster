import mongoose from "mongoose";
import { TicketDoc } from "./ticket";
import { OrderStatus } from "@ticketing/common";

export { OrderStatus };

// build Order interface 
interface BuildOrderParams {
    userId: string
    status: OrderStatus
    expiresAt: Date,
    ticket: TicketDoc
};

// interface for Order from Mongoose
interface OrderDoc extends mongoose.Document, BuildOrderParams {
    // createdAt?: Date
}
// Order Model interface
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: BuildOrderParams): OrderDoc
};

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(OrderStatus),
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret.__v;
            delete ret._id
        },
    }
});

OrderSchema.statics.build = (attrs: BuildOrderParams) => {
    return new Order(attrs);
}
const Order = mongoose.model<OrderDoc, OrderModel>('Order', OrderSchema);

export { Order, BuildOrderParams, OrderDoc };