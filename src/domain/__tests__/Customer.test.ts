import { describe, expect, it } from "vitest";

import { Customer } from "../Customer";
import { CustomerId } from "../CustomerId";
import { Seat } from "../Seat";
import { SeatId } from "../SeatId";

describe("Customer", () => {
    it("exposes the customer identifier it was created with", () => {
        const customerId = new CustomerId("customer-1");
        const customer = new Customer(customerId);

        expect(customer.id).toBe(customerId);
    });

    it("rejects a reservation when the requested seat is already reserved", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seat = new Seat(new SeatId("A1"));
        seat.reserve();

        await expect(customer.placeReservation(seat)).rejects.toThrow(
            "ERR_CANNOT_RESERVE_SEAT",
        );
    });
});
