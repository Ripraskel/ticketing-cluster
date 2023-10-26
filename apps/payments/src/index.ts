import mongoose from 'mongoose';
import { app } from './app';
import { asyncApi } from './asyncApi';
import { OrderCancelledListener, OrderCreatedListener } from './events/order.listener';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.STRIPE_KEY) {
        throw new Error('STRIPE_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }
    try {
        await asyncApi.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        asyncApi.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGNINT', () => asyncApi.client.close());
        process.on('SIGTERM', () => asyncApi.client.close());

        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to mongo db");
    } catch (err) {
        console.error(err)
    }
    
    new OrderCreatedListener(asyncApi.client).listen();
    new OrderCancelledListener(asyncApi.client).listen();
    
    app.listen(3000, () => {
        console.log(`Listerning on port ${3000}!!!!!`)
    })
};


start();