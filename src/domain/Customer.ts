import { CustomerId } from "./CustomerId";
import { Reservation } from "./Reservation";
import { Seat } from "./Seat";

export class Customer {
    #id: CustomerId;
    constructor(id: CustomerId) {
        this.#id = id;
    }
    get id() {
        return this.#id;
    }
}
