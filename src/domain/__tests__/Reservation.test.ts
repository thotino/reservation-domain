import { describe, expect, it } from "vitest";

import { Customer } from "../Customer";
import { CustomerId } from "../CustomerId";
import { EventDispatcher } from "../EventDispatcher";
import { Reservation } from "../Reservation";
import { Seat } from "../Seat";
import { SeatId } from "../SeatId";
import type { ReservationPlacedEvent } from "../types";

describe("Reservation domain", () => {
    it("creates a reservation and emits a ReservationPlaced event when a seat is free", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seat = new Seat(new SeatId("A1"));

        const reservation = Reservation.place(seat, customer);

        expect(seat.isFree).toBe(true);
        expect(reservation.customerId.equals(customer.id)).toBe(true);
        expect(reservation.seatId.equals(seat.id)).toBe(true);

        const events = reservation.collectDomainEvents();
        expect(events).toHaveLength(1);
        expect(events[0].name).toBe("ReservationPlaced");
        expect(events[0].customerId).toBe("customer-1");
        expect(events[0].seatId).toBe("A1");
        expect(events[0].reservationId).toBe(reservation.id);
        expect(events[0].occuredAt).toBeInstanceOf(Date);
        expect(reservation.collectDomainEvents()).toEqual([]);
    });

    it("rejects cancelling a reservation more than once", () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seat = new Seat(new SeatId("A2"));
        const reservation = Reservation.place(seat, customer);

        Reservation.cancel(reservation, seat);

        expect(() => Reservation.cancel(reservation, seat)).toThrow(
            "ERR_RESERVATION_NOT_ACTIVE",
        );
    });

    it("emits a ReservationCancelled event without changing seat availability", () => {
        const customer = new Customer(new CustomerId("customer-2"));
        const seat = new Seat(new SeatId("B1"));
        const reservation = Reservation.place(seat, customer);

        const placedEvents = reservation.collectDomainEvents();
        expect(placedEvents).toHaveLength(1);
        expect(placedEvents[0].name).toBe("ReservationPlaced");

        Reservation.cancel(reservation, seat);

        expect(seat.isFree).toBe(true);
        const cancelledEvents = reservation.collectDomainEvents();
        expect(cancelledEvents).toHaveLength(1);
        expect(cancelledEvents[0].name).toBe("ReservationCancelled");
        expect(cancelledEvents[0].customerId).toBe("customer-2");
        expect(cancelledEvents[0].seatId).toBe("B1");
        expect(cancelledEvents[0].reservationId).toBe(reservation.id);
        expect(cancelledEvents[0].occuredAt).toBeInstanceOf(Date);
        expect(reservation.collectDomainEvents()).toEqual([]);
    });
});

describe("EventDispatcher", () => {
    it("dispatches the event to all handlers registered for the same event name", async () => {
        const dispatcher = new EventDispatcher();
        const handled: string[] = [];

        dispatcher.register("ReservationPlaced", {
            async handle(event: ReservationPlacedEvent) {
                handled.push(`${event.name}:${event.customerId}`);
            },
        });
        dispatcher.register("ReservationPlaced", {
            async handle(event: ReservationPlacedEvent) {
                handled.push(`${event.name}:${event.seatId}`);
            },
        });

        const event: ReservationPlacedEvent = {
            name: "ReservationPlaced",
            seatId: "C3",
            customerId: "customer-3",
            reservationId: "reservation-3",
            occuredAt: new Date(),
            eventId: "event-3",
        };

        await dispatcher.dispatch(event);

        expect(handled).toHaveLength(2);
        expect(handled).toContain("ReservationPlaced:customer-3");
        expect(handled).toContain("ReservationPlaced:C3");
    });

    it("continues dispatching after a handler fails", async () => {
        const dispatcher = new EventDispatcher();
        const handled: string[] = [];

        dispatcher.register("ReservationPlaced", {
            async handle() {
                throw new Error("handler failed");
            },
        });
        dispatcher.register("ReservationPlaced", {
            async handle(event: ReservationPlacedEvent) {
                handled.push(event.reservationId);
            },
        });

        const event: ReservationPlacedEvent = {
            name: "ReservationPlaced",
            seatId: "C4",
            customerId: "customer-4",
            reservationId: "reservation-4",
            occuredAt: new Date(),
            eventId: "event-4",
        };

        await expect(dispatcher.dispatch(event)).resolves.toBeUndefined();

        expect(handled).toEqual(["reservation-4"]);
    });

    it("delivers a Reservation event to a newly registered handler", async () => {
        const reservation = Reservation.place(
            new Seat(new SeatId("C5")),
            new Customer(new CustomerId("customer-5")),
        );
        const event = reservation.collectDomainEvents()[0];
        if (!event || event.name !== "ReservationPlaced") {
            throw new Error(
                "Expected Reservation to emit a ReservationPlaced event",
            );
        }

        const dispatcher = new EventDispatcher();
        let receivedEvent: ReservationPlacedEvent | undefined;

        dispatcher.register("ReservationPlaced", {
            async handle(handledEvent: ReservationPlacedEvent) {
                receivedEvent = handledEvent;
            },
        });

        await dispatcher.dispatch(event);

        expect(receivedEvent).toBe(event);
    });
});
