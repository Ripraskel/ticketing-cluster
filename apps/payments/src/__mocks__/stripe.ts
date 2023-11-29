export const stripe = {
    paymentIntents: {
        create: jest.fn().mockResolvedValue({
            id: "FAKE_STRIPE_PAYMENT_ID",
            client_secret: "FAKE_CLIENT_SECRET"
        }),
        retrieve: jest.fn().mockResolvedValue({
            amount: 1000,
            status: 'succeeded'
        })
    }
};