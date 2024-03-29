import { asyncApi } from './asyncApi';
import { OrderCreatedListener } from './events/order.listener';

const start = async () => {

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
  
    } catch (err) {
        console.error(err)
    }
    
    new OrderCreatedListener(asyncApi.client).listen();
};

start();