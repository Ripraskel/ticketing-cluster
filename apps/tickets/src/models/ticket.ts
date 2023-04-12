import mongoose from "mongoose";

// build Ticket interface 
interface BuildTicketParams {
    title: string
    price: number
    userId: string
};

// interface for Ticket from Mongoose
interface TicketDoc extends mongoose.Document, BuildTicketParams {
    createdAt?: Date
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
        required: true
    },
    userId: {
        type: String,
        required: true
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

TicketSchema.statics.build = (attrs: BuildTicketParams) => {
    return new Ticket(attrs);
}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);

export { Ticket, BuildTicketParams, TicketDoc };