import { SeatId } from "./SeatId";
import { SeatReservationCancelledEvent, SeatReservedEvent } from "./types";

export class Seat {
    #id: SeatId;
    #isFree: boolean = true;
    #events: (SeatReservedEvent | SeatReservationCancelledEvent)[] = [];
    constructor(id: SeatId) {
        this.#id = id;
    }
    get id() {
        return this.#id;
    }
    get isFree() {
        return this.#isFree;
    }
    reserve() {
        if (this.#isFree == true) {
            this.#isFree = false;
            this.#events.push({
                name: "SeatReserved",
                occuredAt: new Date(),
                seatId: this.#id.value,
                eventId: crypto.randomUUID(),
            });
            return;
        }
        throw new Error("ERR_SEAT_ALREADY_RESERVED");
    }
    unreserve() {
        if (this.#isFree == false) {
            this.#isFree = true;
            this.#events.push({
                name: "SeatReservationCancelled",
                occuredAt: new Date(),
                seatId: this.#id.value,
                eventId: crypto.randomUUID(),
            });
            return;
        }
        throw new Error("ERR_SEAT_ALREADY_FREED");
    }
    collectDomainEvents() {
        return this.#events.splice(0);
    }
}
