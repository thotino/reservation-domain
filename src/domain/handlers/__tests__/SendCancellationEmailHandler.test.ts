import { afterEach, describe, expect, it, vi } from "vitest";

import { SendCancellationEmailHandler } from "../SendCancellationEmailHandler";

describe("SendCancellationEmailHandler", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("logs that cancellation was sent to the event customer", async () => {
        const log = vi.fn();
        vi.stubGlobal("console", { log });
        const handler = new SendCancellationEmailHandler();

        await handler.handle({
            name: "ReservationCancelled",
            customerId: "customer-1",
            seatId: "A1",
            reservationId: "reservation-1",
            occurredAt: new Date(),
            eventId: "event-2",
        });

        expect(log).toHaveBeenCalledWith("Email sent to customer customer-1");
    });

    it("throws when the customer email is invalid", async () => {
        const handler = new SendCancellationEmailHandler();

        await expect(
            handler.handle({
                name: "ReservationCancelled",
                customerId: "broken-email",
                seatId: "A1",
                reservationId: "reservation-1",
                occurredAt: new Date(),
                eventId: "event-2",
            }),
        ).rejects.toThrow("ERR_INCORRECT_CUSTOMER_EMAIL");
    });
});
