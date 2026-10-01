import { describe, expect, it, vi } from "vitest";

import { Seat } from "../Seat";
import { SeatId } from "../SeatId";
import { CancelSeatReservationHandler } from "../handlers/CancelSeatReservationHandler";
import { ReserveSeatHandler } from "../handlers/ReserveSeatHandler";
import type { EventDispatcher, SeatRepository } from "../types";

describe("Seat", () => {
    it("starts free and exposes its identifier", () => {
        const seatId = new SeatId("A1");
        const seat = new Seat(seatId);

        expect(seat.id).toBe(seatId);
        expect(seat.isFree).toBe(true);
    });

    it("reserves a free seat and rejects a second reservation", () => {
        const seat = new Seat(new SeatId("A1"));

        seat.reserve();

        expect(seat.isFree).toBe(false);
        expect(() => seat.reserve()).toThrow("ERR_SEAT_ALREADY_RESERVED");
        expect(seat.isFree).toBe(false);
    });

    it("unreserves a reserved seat and rejects freeing an already free seat", () => {
        const seat = new Seat(new SeatId("A1"));
        seat.reserve();

        seat.unreserve();

        expect(seat.isFree).toBe(true);
        expect(() => seat.unreserve()).toThrow("ERR_SEAT_ALREADY_FREED");
        expect(seat.isFree).toBe(true);
    });
});

describe("Seat reservation event handlers", () => {
    it("reserves the seat in response to a ReservationPlaced event", async () => {
        const seat = new Seat(new SeatId("A1"));
        const seatRepository: SeatRepository = {
            findOne: vi.fn(async () => seat),
            save: vi.fn(async () => {}),
        };
        const dispatch = vi.fn(async (event: unknown) => event);
        const eventDispatcher: EventDispatcher = {
            register: vi.fn(),
            dispatch: dispatch as unknown as EventDispatcher["dispatch"],
        };
        const handler = new ReserveSeatHandler(seatRepository, eventDispatcher);

        await handler.handle({
            name: "ReservationPlaced",
            customerId: "customer-1",
            seatId: "A1",
            reservationId: "reservation-1",
            occurredAt: new Date(),
            eventId: "event-1",
        });

        expect(seat.isFree).toBe(false);
        expect(seatRepository.save).toHaveBeenCalledWith(seat);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "SeatReserved",
                seatId: "A1",
            }),
        );
    });

    it("frees the seat in response to a ReservationCancelled event", async () => {
        const seat = new Seat(new SeatId("A1"));
        seat.reserve();
        const seatRepository: SeatRepository = {
            findOne: vi.fn(async () => seat),
            save: vi.fn(async () => {}),
        };
        const dispatch = vi.fn(async (event: unknown) => event);
        const eventDispatcher: EventDispatcher = {
            register: vi.fn(),
            dispatch: dispatch as unknown as EventDispatcher["dispatch"],
        };
        const handler = new CancelSeatReservationHandler(
            seatRepository,
            eventDispatcher,
        );

        await handler.handle({
            name: "ReservationCancelled",
            customerId: "customer-1",
            seatId: "A1",
            reservationId: "reservation-1",
            occuredAt: new Date(),
            eventId: "event-2",
        });

        expect(seat.isFree).toBe(true);
        expect(seatRepository.save).toHaveBeenCalledWith(seat);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "SeatReservationCancelled",
                seatId: "A1",
            }),
        );
    });
});
