import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Ticket } from "../../models/ticket"
import { OrderStatus, PaymentCreatedEvent, TicketCreatedEvent, TicketUpdatedEvent } from "@ticketing/common"
import { PaymentCreatedListener } from "../payment.listener"
import { Order } from "../../models/order"

describe("Test Ticket Listeners", () => {
    describe("TicketCreateListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = async () => {
                const ticket = Ticket.build({
                    id: createMongooseId(),
                    version: 0,
                    title: "Taylors",
                    price: 30,
                });
                await ticket.save();

                const order = Order.build({
                    userId: createMongooseId(),
                    status: OrderStatus.Created,
                    expiresAt: new Date(),
                    ticket
                });
                await order.save();

                const listener = new PaymentCreatedListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;
    
                const paymentCreatedListenerData: PaymentCreatedEvent['data'] = {
                    id: createMongooseId(),
                    orderId: order.id,
                    stripeId: "12345"
                }; 
    
                return {
                    listener,
                    mockMessage,
                    paymentCreatedListenerData
                }
            };
    
            it("Updates Order status when payment event received", async () => {
                const {listener, paymentCreatedListenerData, mockMessage} = await onMessageSetup();
                await listener.onMessage(paymentCreatedListenerData, mockMessage);
    
                const order = await Order.findById(paymentCreatedListenerData.orderId);
    
                expect.assertions(1);
                expect(order?.status).toEqual(OrderStatus.Complete);
            });
    
            it("Acks when save is successful", async () => {
                const {listener, paymentCreatedListenerData, mockMessage} = await onMessageSetup();
                await listener.onMessage(paymentCreatedListenerData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when order not found and does not call Ack", async () => {
                const {listener, paymentCreatedListenerData, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...paymentCreatedListenerData, orderId: "1234"},
                    mockMessage
                )).rejects.toThrowError();
    
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
