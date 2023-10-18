import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Ticket } from "../../models/ticket"
import { OrderCreatedListener } from "../order.listener"
import { OrderCreatedEvent, OrderStatus, Subjects } from "@ticketing/common"

describe("Test Ticket Listeners", () => {
    describe("OrderCreateListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = async () => {
                const listener = new OrderCreatedListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;

                const ticket = Ticket.build({
                    title: "Taylors",
                    price: 30,
                    userId: createMongooseId(),
                });
                await ticket.save();
    
                const OrderCreatedEventData: OrderCreatedEvent['data'] = {
                    id: createMongooseId(),
                    version: 0,
                    userId: createMongooseId(),
                    status: OrderStatus.Created,
                    expiresAt: "doesn't matter",
                    ticket: {
                        id: ticket.id,
                        price: 30,
                    }
                }; 
    
                return {
                    listener,
                    mockMessage,
                    OrderCreatedEventData
                }
            };
    
            it("Updates ticket with orderId", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderCreatedEventData, mockMessage);
    
                const ticket = await Ticket.findById(OrderCreatedEventData.ticket.id);
    
                expect.assertions(1);
                expect(ticket?.orderId).toEqual(OrderCreatedEventData.id);
            });
    
            it("Publishes ticket update", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderCreatedEventData, mockMessage);

                await Ticket.findById(OrderCreatedEventData.ticket.id);

                // Get arguments the publisher was called with
                const [eventSubject, ticketStringified, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;
                
                // Check the correct event was published
                expect(JSON.parse(ticketStringified).id).toEqual(OrderCreatedEventData.ticket.id);
                expect(JSON.parse(ticketStringified).orderId).toEqual(OrderCreatedEventData.id);
                expect(eventSubject).toEqual(Subjects.TicketUpdated);
            });

            it("Acks when save is successful", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderCreatedEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...OrderCreatedEventData, id: {} as unknown as string},
                    mockMessage
                )).rejects.toThrowError();
    
                expect(mockMessage.ack).not.toBeCalled();
            });

            it("Throws when ticket ordered doesn't exist in DB and does not call Ack", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...OrderCreatedEventData, ticket: { id: createMongooseId(), price: 20 }},
                    mockMessage
                )).rejects.toThrowError("Received order for non-existant ticket");
                
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
