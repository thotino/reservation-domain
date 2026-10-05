import { afterEach, describe, expect, it, vi } from "vitest";

import { SendConfirmationEmailHandler } from "../SendConfirmationEmailHandler";

describe("SendConfirmationEmailHandler", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("logs that confirmation was sent to the event customer", async () => {
        const log = vi.fn();
        vi.stubGlobal("console", { log });
        const handler = new SendConfirmationEmailHandler();

        await handler.handle({
            name: "ReservationPlaced",
            customerId: "customer-1",
            seatId: "A1",
            reservationId: "reservation-1",
            occurredAt: new Date(),
            eventId: "event-1",
        });

        expect(log).toHaveBeenCalledWith("Email sent to customer customer-1");
    });

    it("throws when the customer email is invalid", async () => {
        const handler = new SendConfirmationEmailHandler();

        await expect(
            handler.handle({
                name: "ReservationPlaced",
                customerId: "broken-email",
                seatId: "A1",
                reservationId: "reservation-1",
                occurredAt: new Date(),
                eventId: "event-1",
            }),
        ).rejects.toThrow("ERR_INCORRECT_CUSTOMER_EMAIL");
    });
});
