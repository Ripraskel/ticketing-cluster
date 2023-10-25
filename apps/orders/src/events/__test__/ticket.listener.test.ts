import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Ticket } from "../../models/ticket"
import { TicketCreatedListener, TicketUpdatedListener } from "../ticket.listener"
import { TicketCreatedEvent, TicketUpdatedEvent } from "@ticketing/common"

describe("Test Ticket Listeners", () => {
    describe("TicketCreateListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = () => {
                const listener = new TicketCreatedListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;
    
                const ticketCreatedEventData: TicketCreatedEvent['data'] = {
                    id: createMongooseId(),
                    version: 0,
                    title: "Taylors",
                    price: 30,
                    userId: createMongooseId()
                }; 
    
                return {
                    listener,
                    mockMessage,
                    ticketCreatedEventData
                }
            };
    
            it("Creates new ticket in the database", async () => {
                const {listener, ticketCreatedEventData, mockMessage} = onMessageSetup();
                await listener.onMessage(ticketCreatedEventData, mockMessage);
    
                const tickets = await Ticket.find({});
    
                expect.assertions(2);
                expect(tickets[0].id).toEqual(ticketCreatedEventData.id);
                expect(tickets.length).toEqual(1);
            });
    
            it("Acks when save is successful", async () => {
                const {listener, ticketCreatedEventData, mockMessage} = onMessageSetup();
                await listener.onMessage(ticketCreatedEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, ticketCreatedEventData, mockMessage} = onMessageSetup();
                await expect(listener.onMessage(
                    {...ticketCreatedEventData, price: "INVALID" as unknown as number},
                    mockMessage
                )).rejects.toThrowError();
    
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
    describe("TicketUpdatedListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = async () => {
                const listener = new TicketUpdatedListener(asyncApi.client);
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
    
                const ticketUpdatedEventData: TicketUpdatedEvent['data']= {
                    id: ticket.id,
                    version: ticket.version + 1,
                    title: ticket.title,
                    price: 300,
                    userId: createMongooseId()
                }

                return {
                    listener,
                    mockMessage,
                    ticketUpdatedEventData
                }
            };
    
            it("Updates ticket if version is 1 ahead of one currently saved in the database", async () => {
                const {listener, ticketUpdatedEventData, mockMessage} = await onMessageSetup();
                
                await listener.onMessage(ticketUpdatedEventData, mockMessage);
    
                const tickets = await Ticket.find({});
    
                expect.assertions(2);
                expect(tickets[0].id).toEqual(ticketUpdatedEventData.id);
                expect(tickets.length).toEqual(1);
            });
    
            it("Throws when version of new ticket is not 1 ahead", async () => {
                const {listener, ticketUpdatedEventData, mockMessage} = await onMessageSetup();
    
                ticketUpdatedEventData.version = 2; // set version 1 to many ahead
                
                await expect(listener.onMessage(
                    ticketUpdatedEventData,
                    mockMessage
                )).rejects.toThrowError();
            })
    
            it("Acks when save is successful", async () => {
                const {listener, ticketUpdatedEventData, mockMessage} = await onMessageSetup();
    
                await listener.onMessage(ticketUpdatedEventData, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, ticketUpdatedEventData, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...ticketUpdatedEventData, price: "INVALID" as unknown as number},
                    mockMessage
                )).rejects.toThrowError();
                
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
