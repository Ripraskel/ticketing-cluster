import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

const client = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
});

client.on('connect', () => {
    console.log("Listener connected to NATS");

    client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });

    const options = client.subscriptionOptions()
        .setManualAckMode(true)
        .setDeliverAllAvailable()
        .setDurableName('Orders')

    const subscription = client.subscribe(
        'ticket:created',
        'orders-service-queue-group',
        options
    );

    subscription.on('message', (msg: Message) => {
        console.log('Message received.', `#${msg.getSequence()}`, ` ; Data: ${msg.getData()}`);

        msg.ack();
    })
});

process.on('SIGNINT', () => client.close());
process.on('SIGTERM', () => client.close());