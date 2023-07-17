import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

const client = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

client.on('connect', async () => {
    console.log('Publisher connected to NATS');

    client.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });
    const TicketCreated = new TicketCreatedPublisher(client)
    
    await TicketCreated.publish({
        id: '123',
        title: 'concert',
        price: 20
    });
});

