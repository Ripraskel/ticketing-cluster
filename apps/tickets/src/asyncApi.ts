import nats, { Stan } from 'node-nats-streaming';

class AsyncApi {
    private _client?: Stan;

    get client() {
        if (!this._client) {
            throw new Error(`Can't use client before a connection is established`);
        }
        return this._client;
    };

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, {url});

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to NATS');
                resolve();
            });

            this.client.on('error', (err) => {
                reject(err);
            })
        })
    }

}

export const asyncApi = new AsyncApi();