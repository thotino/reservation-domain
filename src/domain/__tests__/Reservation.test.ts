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

        const reservation = await customer.placeReservation(seat);

        expect(seat.isFree).toBe(false);
        expect(reservation.customerId.equals(customer.id)).toBe(true);
        expect(reservation.seatId.equals(seat.id)).toBe(true);

        const events = reservation.pullEvents();
        expect(events).toHaveLength(1);
        expect(events[0].name).toBe("ReservationPlaced");
        expect(events[0].customerId).toBe("customer-1");
        expect(events[0].seatId).toBe("A1");
        expect(events[0].reservationId).toBe(reservation.id);
        expect(events[0].occuredAt).toBeInstanceOf(Date);
        expect(reservation.pullEvents()).toEqual([]);
    });

    it("throws when trying to reserve an already reserved seat", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seat = new Seat(new SeatId("A2"));

        await customer.placeReservation(seat);

        await expect(customer.placeReservation(seat)).rejects.toThrow(
            "ERR_CANNOT_RESERVE_SEAT",
        );
    });

    it("cancels a reservation and emits a ReservationCancelled event", async () => {
        const customer = new Customer(new CustomerId("customer-2"));
        const seat = new Seat(new SeatId("B1"));
        const reservation = await customer.placeReservation(seat);

        const placedEvents = reservation.pullEvents();
        expect(placedEvents).toHaveLength(1);
        expect(placedEvents[0].name).toBe("ReservationPlaced");

        await customer.cancelReservation(reservation, seat);

        expect(seat.isFree).toBe(true);
        const cancelledEvents = reservation.pullEvents();
        expect(cancelledEvents).toHaveLength(1);
        expect(cancelledEvents[0].name).toBe("ReservationCancelled");
        expect(cancelledEvents[0].customerId).toBe("customer-2");
        expect(cancelledEvents[0].seatId).toBe("B1");
        expect(cancelledEvents[0].reservationId).toBe(reservation.id);
        expect(cancelledEvents[0].occuredAt).toBeInstanceOf(Date);
        expect(reservation.pullEvents()).toEqual([]);
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

        await dispatcher.dispatch({
            name: "ReservationPlaced",
            seatId: "C3",
            customerId: "customer-3",
            reservationId: "reservation-3",
            occuredAt: new Date(),
        });

        expect(handled).toHaveLength(2);
        expect(handled).toContain("ReservationPlaced:customer-3");
        expect(handled).toContain("ReservationPlaced:C3");
    });
});
