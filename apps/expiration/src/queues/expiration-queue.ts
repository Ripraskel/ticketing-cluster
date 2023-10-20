import Queue from "bull";

interface IPayload {
    orderId: string
}

const expirationQueue = new Queue<IPayload>('order-expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    console.log("I want to publish expiration:complete for orderId", job.data.orderId)
});

export {
    expirationQueue
};