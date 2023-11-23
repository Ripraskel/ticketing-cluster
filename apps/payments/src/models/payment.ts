import mongoose from "mongoose";

// build Order interface 
interface BuildPaymentParams {
    orderId: string
    stripeId: string
    complete: boolean
};

// interface for Order from Mongoose
interface PaymentDoc extends mongoose.Document, BuildPaymentParams {
    version: number
}
// Payment Model interface
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: BuildPaymentParams): PaymentDoc
};

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true
    },
    complete: {
        type: Boolean,
        required: true
    }

}, {
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        },
    }
});

PaymentSchema.statics.build = (attrs: BuildPaymentParams) => {
    return new Payment(attrs);
}
const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', PaymentSchema);

export { Payment, BuildPaymentParams, PaymentDoc };