import Queue from "bull";
import { asyncApi } from "../asyncApi";
import { OrderExpiredPublisher } from "../events/order.publisher";

interface IPayload {
    orderId: string
}

const expirationQueue = new Queue<IPayload>('order-expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    await new OrderExpiredPublisher(asyncApi.client).publish({
        id: job.data.orderId,
    });
});

export {
    expirationQueue
};