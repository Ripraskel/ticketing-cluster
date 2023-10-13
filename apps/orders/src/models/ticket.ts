import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";

// Common Ticket fields
interface ITicket {
    title: string
    price: number
}

// Build Ticket fields
interface BuildTicketParams extends ITicket {
    id: string
    version: number
};

// interface for Ticket from Mongoose
interface TicketDoc extends mongoose.Document, ITicket {
    isReserved(): Promise<boolean>
}

// interface for identifying an Event
interface IEventIdentifier {
    id: string,
    version: number
}
// Ticket Model interface
interface TicketModel extends mongoose.Model<TicketDoc> {
    /**
     * @param attrs - Ticket parameters needed to create a ticket
     */
    build(attrs: BuildTicketParams): TicketDoc;
    /**
     * @param event 
     * @description This function looks for the previous event for the ticket provided.
     * If the previous version of the ticket is found then the TicketDoc is returned. 
     * If not found it will return null (A sign that there is some out of order processing going on)
     */
    findByEvent(event: IEventIdentifier): Promise<TicketDoc | null>;
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
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret.__v;
            delete ret._id
        },
    }
});

TicketSchema.statics.build = (attrs: BuildTicketParams) => {
    return new Ticket({
        ...attrs,
        _id: attrs.id,
        id: undefined
    });
};

TicketSchema.statics.findByEvent = async (event: IEventIdentifier): Promise<TicketDoc | null> => {
    return await Ticket.findOne({ 
        _id: event.id,
        version: event.version - 1 // See if we already have previous version
    });
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