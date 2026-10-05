import { describe, expect, it } from "vitest";

import { UpdateStatisticsHandler } from "../UpdateStatisticsHandler";
import type {
    SeatReservationCancelledEvent,
    SeatReservedEvent,
} from "../../types";

describe("UpdateStatisticsHandler", () => {
    it("handles a SeatReserved event", async () => {
        const handler = new UpdateStatisticsHandler();
        const event: SeatReservedEvent = {
            name: "SeatReserved",
            seatId: "A1",
            occurredAt: new Date(),
            eventId: "event-1",
        };

        await expect(handler.handle(event)).resolves.toBeUndefined();
    });

    it("handles a SeatReservationCancelled event", async () => {
        const handler = new UpdateStatisticsHandler();
        const event: SeatReservationCancelledEvent = {
            name: "SeatReservationCancelled",
            seatId: "A1",
            occurredAt: new Date(),
            eventId: "event-2",
        };

        await expect(handler.handle(event)).resolves.toBeUndefined();
    });

    it("throws for an unknown event name", async () => {
        const handler = new UpdateStatisticsHandler();
        const event = {
            name: "UnknownEvent",
            seatId: "A1",
            occurredAt: new Date(),
            eventId: "event-3",
        } as unknown as SeatReservedEvent | SeatReservationCancelledEvent;

        await expect(handler.handle(event)).rejects.toThrow(
            "ERR_UNKNOWN_EVENT_NAME",
        );
    });
});
