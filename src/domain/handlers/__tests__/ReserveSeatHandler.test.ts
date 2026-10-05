import { describe, expect, it, vi } from "vitest";

import { Seat } from "../../Seat";
import { SeatId } from "../../SeatId";
import { ReserveSeatHandler } from "../ReserveSeatHandler";
import type { EventDispatcher, SeatRepository } from "../../types";

describe("ReserveSeatHandler", () => {
    it("reserves and saves the seat, then dispatches its domain event", async () => {
        const seat = new Seat(new SeatId("A1"));
        const effects: string[] = [];
        const seatRepository: SeatRepository = {
            findOne: vi.fn(async () => seat),
            save: vi.fn(async () => {
                effects.push("save");
            }),
        };
        const dispatch = vi.fn(async (event: unknown) => {
            effects.push("dispatch");
            return event;
        });
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

        expect(seatRepository.findOne).toHaveBeenCalledWith(new SeatId("A1"));
        expect(seat.isFree).toBe(false);
        expect(seatRepository.save).toHaveBeenCalledWith(seat);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({ name: "SeatReserved", seatId: "A1" }),
        );
        expect(effects).toEqual(["save", "dispatch"]);
    });

    it("throws when the seat does not exist and performs no writes or dispatch", async () => {
        const seatRepository: SeatRepository = {
            findOne: vi.fn(async () => undefined),
            save: vi.fn(async () => {}),
        };
        const dispatch = vi.fn(async (event: unknown) => event);
        const eventDispatcher: EventDispatcher = {
            register: vi.fn(),
            dispatch: dispatch as unknown as EventDispatcher["dispatch"],
        };
        const handler = new ReserveSeatHandler(seatRepository, eventDispatcher);

        await expect(
            handler.handle({
                name: "ReservationPlaced",
                customerId: "customer-1",
                seatId: "missing",
                reservationId: "reservation-1",
                occurredAt: new Date(),
                eventId: "event-1",
            }),
        ).rejects.toThrow("ERR_SEAT_NOT_FOUND");

        expect(seatRepository.save).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });

    it("propagates the error when the seat is already reserved", async () => {
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
        const handler = new ReserveSeatHandler(seatRepository, eventDispatcher);

        await expect(
            handler.handle({
                name: "ReservationPlaced",
                customerId: "customer-1",
                seatId: "A1",
                reservationId: "reservation-1",
                occurredAt: new Date(),
                eventId: "event-1",
            }),
        ).rejects.toThrow("ERR_SEAT_ALREADY_RESERVED");

        expect(seatRepository.save).not.toHaveBeenCalled();
        expect(dispatch).not.toHaveBeenCalled();
    });
});
