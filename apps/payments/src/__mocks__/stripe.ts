export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({ id: "FAKE_STRIPE_PAYMENT_ID" })
    }
};