import { Message } from "node-nats-streaming"
import { asyncApi } from "../../asyncApi"
import { createMongooseId } from "../../test/actions"
import { Ticket } from "../../models/ticket"
import { TicketCreatedListener, TicketUpdatedListener } from "../ticket.listener"

describe("Test Ticket Listeners", () => {
    describe("TicketCreateListener Class", () => {
        describe("onMessage Function", () => {
            const onMessageSetup = () => {
                const listener = new TicketCreatedListener(asyncApi.client);
                const mockMessage = {
                    ack: jest.fn()
                } as unknown as Message;
    
                const fakeTicket = {
                    id: createMongooseId(),
                    version: 0,
                    title: "Taylors",
                    price: 30,
                    userId: createMongooseId()
                }; 
    
                return {
                    listener,
                    mockMessage,
                    fakeTicket
                }
            };
    
            it("Creates new ticket in the database", async () => {
                const {listener, fakeTicket, mockMessage} = onMessageSetup();
                await listener.onMessage(fakeTicket, mockMessage);
    
                const tickets = await Ticket.find({});
    
                expect.assertions(2);
                expect(tickets[0].id).toEqual(fakeTicket.id);
                expect(tickets.length).toEqual(1);
            });
    
            it("Acks when save is successful", async () => {
                const {listener, fakeTicket, mockMessage} = onMessageSetup();
                await listener.onMessage(fakeTicket, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, fakeTicket, mockMessage} = onMessageSetup();
                await expect(listener.onMessage(
                    {...fakeTicket, price: "INVALID" as unknown as number},
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
    
                const fakeTicket = {
                    id: createMongooseId(),
                    version: 0,
                    title: "Taylors",
                    price: 30,
                    userId: createMongooseId()
                }
                
                const newTicket = Ticket.build(fakeTicket); 
                await newTicket.save();
    
                return {
                    listener,
                    mockMessage,
                    fakeTicket
                }
            };
    
            it("Updates ticket if version is 1 ahead of one currently saved in the database", async () => {
                const {listener, fakeTicket, mockMessage} = await onMessageSetup();
                
                fakeTicket.version++;
                await listener.onMessage(fakeTicket, mockMessage);
    
                const tickets = await Ticket.find({});
    
                expect.assertions(2);
                expect(tickets[0].id).toEqual(fakeTicket.id);
                expect(tickets.length).toEqual(1);
            });
    
            it("Throws when version of new ticket is not 1 ahead", async () => {
                const {listener, fakeTicket, mockMessage} = await onMessageSetup();
    
                fakeTicket.version = 2; // set version 1 to many ahead
                
                await expect(listener.onMessage(
                    fakeTicket,
                    mockMessage
                )).rejects.toThrowError();
            })
    
            it("Acks when save is successful", async () => {
                const {listener, fakeTicket, mockMessage} = await onMessageSetup();
    
                fakeTicket.version++;
                await listener.onMessage(fakeTicket, mockMessage);
                expect(mockMessage.ack).toBeCalled();
            });
    
            it("Throws when save fails and does not call Ack", async () => {
                const {listener, fakeTicket, mockMessage} = await onMessageSetup();
                await expect(listener.onMessage(
                    {...fakeTicket, price: "INVALID" as unknown as number},
                    mockMessage
                )).rejects.toThrowError();
                
                expect(mockMessage.ack).not.toBeCalled();
            });
        });
    });
})
