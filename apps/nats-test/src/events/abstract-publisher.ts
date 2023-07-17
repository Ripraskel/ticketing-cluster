import { Stan } from "node-nats-streaming";
import { Event } from "./event-types";

export abstract class Publisher<T extends Event> {
    abstract subject: T['subject'];
    private client: Stan;

    constructor(client: Stan) {
        this.client = client;

        process.on('SIGNINT', () => client.close());
        process.on('SIGTERM', () => client.close());
    }

    publish(data: T['data']): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.publish(this.subject, JSON.stringify(data), (err) => {
                if (err) {
                    return reject(err);
                }

                console.log("Event published. Subject: ", this.subject);
                resolve();
            })
        })

    }
}