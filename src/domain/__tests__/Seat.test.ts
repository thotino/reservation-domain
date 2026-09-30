import { describe, expect, it } from "vitest";

import { Seat } from "../Seat";
import { SeatId } from "../SeatId";

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
