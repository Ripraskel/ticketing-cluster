import mongoose from "mongoose";
interface BuildTicketParams {
    title: string;
    price: number;
    userId: string;
}
interface TicketDoc extends mongoose.Document, BuildTicketParams {
    createdAt?: Date;
}
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: BuildTicketParams): TicketDoc;
}
declare const Ticket: TicketModel;
export { Ticket };
