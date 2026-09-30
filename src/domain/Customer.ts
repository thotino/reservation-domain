import { CustomerId } from "./CustomerId";
import { Reservation } from "./Reservation";
import { Seat } from "./Seat";

export class Customer {
    #id: CustomerId;
    constructor(id: CustomerId) {
        this.#id = id
    }
    get id() { return this.#id }
    async placeReservation(seat: Seat) {
        if (!seat.isFree) { 
            throw new Error("ERR_CANNOT_RESERVE_SEAT");
         }
        const reservation = Reservation.place(seat, this);
        return reservation
    }
    async cancelReservation(reservation: Reservation, seat: Seat) {
        return Reservation.cancel(reservation, seat)
    }
}