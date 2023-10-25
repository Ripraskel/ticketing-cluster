import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Order } from "../../models/order"
import { OrderCreatedListener, OrderCancelledListener } from "../order.listener"
import { OrderCreatedEvent, OrderCancelledEvent, OrderStatus } from "@ticketing/common"

describe("Test Ticket Listeners", () => {
    describe("OrderCreatedListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = () => {
                const listener = new OrderCreatedListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;
    
                const OrderCreatedEventData: OrderCreatedEvent['data'] = {
                    id: createMongooseId(),
                    version: 0,
                    expiresAt: new Date().getDate().toString(),
                    status: OrderStatus.Created,
                    ticket: {
                        id: createMongooseId(),
                        price: 20
                    },
                    userId: createMongooseId()
                }; 
    
                return {
                    listener,
                    mockMessage,
                    OrderCreatedEventData
                }
            };
    
            it("Creates new order in the database", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = onMessageSetup();
                await listener.onMessage(OrderCreatedEventData, mockMessage);
    
                const orders = await Order.find({});
    
                expect.assertions(2);
                expect(orders[0].id).toEqual(OrderCreatedEventData.id);
                expect(orders.length).toEqual(1);
            });
    
            it("Acks when save is successful", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = onMessageSetup();
                await listener.onMessage(OrderCreatedEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, OrderCreatedEventData, mockMessage} = onMessageSetup();
                await expect(listener.onMessage(
                    {...OrderCreatedEventData, version: "INVALID" as unknown as number},
                    mockMessage
                )).rejects.toThrowError();
    
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });

    describe("OrderCancelledListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = async () => {
                const listener = new OrderCancelledListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;
    
                const order = Order.build({
                    id: createMongooseId(),
                    version: 0,
                    status: OrderStatus.Created,
                    userId: createMongooseId(),
                    price: 20
                }); 
                await order.save();

                const OrderCancelledEventData: OrderCancelledEvent['data']= {
                    id: order.id,
                    version: order.version + 1,
                    ticket: {
                        id: createMongooseId(),
                    }
                }
                
                return {
                    listener,
                    mockMessage,
                    OrderCancelledEventData
                }
            };
    
            it("Updates order if version is 1 ahead of one currently saved in the database", async () => {
                const {listener, OrderCancelledEventData, mockMessage} = await onMessageSetup();
                
                await listener.onMessage(OrderCancelledEventData, mockMessage);
    
                const orders = await Order.find({});
    
                expect.assertions(2);
                expect(orders[0].id).toEqual(OrderCancelledEventData.id);
                expect(orders.length).toEqual(1);
            });
    
            it("Throws when version of new ticket is not 1 ahead", async () => {
                const {listener, OrderCancelledEventData, mockMessage} = await onMessageSetup();
    
                OrderCancelledEventData.version = 2; // set version 1 to many ahead
                
                await expect(listener.onMessage(
                    OrderCancelledEventData,
                    mockMessage
                )).rejects.toThrowError();
            })
    
            it("Acks when save is successful", async () => {
                const {listener, OrderCancelledEventData, mockMessage} = await onMessageSetup();

                await listener.onMessage(OrderCancelledEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, OrderCancelledEventData, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...OrderCancelledEventData, version: "INVALID" as unknown as number},
                    mockMessage
                )).rejects.toThrowError();
                
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
