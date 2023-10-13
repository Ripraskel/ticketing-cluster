import { Ticket } from "../ticket";

it("Implements optimistic concurrency", async () => {
    const ticket = Ticket.build({
        title: "bifsfs",
        price: 5,
        userId: "fssfs"
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance?.set({price: 10});
    secondInstance?.set({price: 20});

    await firstInstance?.save();

    await expect(secondInstance?.save()).rejects.toThrowError();
});

it("Increments the version number when changes are made", async () => {
    const ticket = Ticket.build({
        title: "bifsfs",
        price: 5,
        userId: "fssfs"
    });

    expect.assertions(2);
    await ticket.save();
    expect(ticket.version).toEqual(0);

    ticket.set({price: 10});
    await ticket.save();
    expect(ticket.version).toEqual(1);
})