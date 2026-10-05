import { afterEach, describe, expect, it, vi } from "vitest";

import { RecordAuditLogHandler } from "../RecordAuditLogHandler";

describe("RecordAuditLogHandler", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("logs the seat and customer from a reservation event", async () => {
        const log = vi.fn();
        vi.stubGlobal("console", { log });
        const handler = new RecordAuditLogHandler();

        await handler.handle({
            name: "ReservationPlaced",
            customerId: "customer-1",
            seatId: "A1",
            reservationId: "reservation-1",
            occurredAt: new Date(),
            eventId: "event-1",
        });

        expect(log).toHaveBeenCalledWith(
            "Reservation for seat A1 placed by customer customer-1",
        );
    });
});
