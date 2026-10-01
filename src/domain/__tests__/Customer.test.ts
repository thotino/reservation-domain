import { describe, expect, it } from "vitest";

import { Customer } from "../Customer";
import { CustomerId } from "../CustomerId";

describe("Customer", () => {
    it("exposes the customer identifier it was created with", () => {
        const customerId = new CustomerId("customer-1");
        const customer = new Customer(customerId);
        expect(customer.id).toBe(customerId);
    });
});
