import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Ticket } from "../../models/ticket"
import { OrderExpiredListener } from "../order.listener"
import { OrderExpiredEvent, OrderStatus, Subjects } from "@ticketing/common"
import { Order } from "../../models/order"

describe("Test Ticket Listeners", () => {
    describe("OrderExpiredListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = async () => {
                const listener = new OrderExpiredListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;

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
    
                const OrderExpiredEventData: OrderExpiredEvent['data'] = {
                    id: order.id,
                }; 
    
                return {
                    listener,
                    mockMessage,
                    OrderExpiredEventData
                }
            };
    
            it("Sets Order Status to cancelled", async () => {
                const {listener, OrderExpiredEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderExpiredEventData, mockMessage);
    
                const order = await Order.findById(OrderExpiredEventData.id);
    
                expect.assertions(1);
                expect(order?.status).toEqual(OrderStatus.Cancelled);
            });

            it("Doesn't do anything but call ack if order is complete", async () => {
                const {listener, OrderExpiredEventData, mockMessage} = await onMessageSetup();
                const order = await Order.findById(OrderExpiredEventData.id);
                order?.set({ status: OrderStatus.Complete });
                await order?.save();

                await listener.onMessage(OrderExpiredEventData, mockMessage);
    
                const orderAfterEvent = await Order.findById(OrderExpiredEventData.id);
                
                expect.assertions(3);
                expect(orderAfterEvent?.status).toEqual(OrderStatus.Complete);
                expect(orderAfterEvent?.version).toEqual(order?.version);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Publishes order cancelled event", async () => {
                const {listener, OrderExpiredEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderExpiredEventData, mockMessage);

                await Order.findById(OrderExpiredEventData.id);

                // Get arguments the publisher was called with
                const [eventSubject, orderStringified, callback] = (asyncApi.client.publish as jest.Mock).mock.lastCall;
                
                // Check the correct event was published
                expect(JSON.parse(orderStringified).id).toEqual(OrderExpiredEventData.id);
                expect(eventSubject).toEqual(Subjects.OrderCancelled);
            });

            it("Acks when save is successful", async () => {
                const {listener, OrderExpiredEventData, mockMessage} = await onMessageSetup();
                await listener.onMessage(OrderExpiredEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });

            it("Throws when order expired doesn't exist in DB and does not call Ack", async () => {
                const {listener, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    { id: createMongooseId() },
                    mockMessage
                )).rejects.toThrowError("Order not found");
                
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
