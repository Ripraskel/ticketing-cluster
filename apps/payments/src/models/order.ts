import mongoose from "mongoose";
import { OrderStatus } from "@ticketing/common";

export { OrderStatus };

// Order interface
interface IOrder {
    userId: string
    status: OrderStatus
    version: number
    price: number
}
// build Order interface 
interface BuildOrderParams extends IOrder {
    id: string
};

// interface for Order from Mongoose
interface OrderDoc extends mongoose.Document, IOrder {

}

// interface for identifying an Event
interface IEventIdentifier {
    id: string,
    version: number
}

// Order Model interface
interface OrderModel extends mongoose.Model<OrderDoc> {
    /**
    * @param attrs - Order parameters needed to create an order
    */
    build(attrs: BuildOrderParams): OrderDoc;
    /**
     * @param event 
     * @description This function looks for the previous event for the order provided.
     * If the previous version of the order is found then the OrderDoc is returned. 
     * If not found it will return null (A sign that there is some out of order processing going on)
     */
    findByEvent(event: IEventIdentifier): Promise<OrderDoc | null>;
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
    // Need explicit version field so that if nothing else changes when an update comes in the version will.
    // i.e Mongo won't update the version automatically if the ticket has no changes despite save() being called
    version: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    optimisticConcurrency: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        },
    }
});

OrderSchema.statics.build = (attrs: BuildOrderParams) => {
    return new Order({
        ...attrs,
        _id: attrs.id,
        id: undefined
    });
};

OrderSchema.statics.findByEvent = async (event: IEventIdentifier): Promise<OrderDoc | null> => {
    return await Order.findOne({ 
        _id: event.id,
        version: event.version - 1 // See if we already have previous version
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', OrderSchema);

export { Order, BuildOrderParams, OrderDoc };