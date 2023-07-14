import nats from 'node-nats-streaming';

const client = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

client.on('connect', () => {
    console.log('Publisher connected to NATS');

    client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });

    const data = JSON.stringify({
        id: '123',
        title: 'concert',
        price: 20
    });

    client.publish('ticket:created', data, () => {
        console.log('Event published');
    })
})

process.on('SIGNINT', () => client.close());
process.on('SIGTERM', () => client.close());