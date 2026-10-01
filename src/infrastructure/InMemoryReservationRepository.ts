import { Customer } from "../domain/Customer";
import { CustomerId } from "../domain/CustomerId";
import { Reservation } from "../domain/Reservation";
import { Seat } from "../domain/Seat";
import { SeatId } from "../domain/SeatId";
import {
    CustomerRepository,
    ReservationRepository,
    SeatRepository,
} from "../domain/types";

export class InMemoryReservationRepository implements ReservationRepository {
    #reservations: Reservation[] = [];
    async save(reservation: Reservation) {
        const reservationIndex = this.#reservations.findIndex(
            savedReservation => savedReservation.id === reservation.id,
        );
        if (reservationIndex != -1) {
            this.#reservations[reservationIndex] = reservation;
            return;
        }
        this.#reservations.push(reservation);
    }
    async findOneBySeatId(seatId: SeatId) {
        return this.#reservations.find(reservation =>
            reservation.seatId.equals(seatId),
        );
    }
}

export class InMemorySeatRepository implements SeatRepository {
    #seats: Seat[] = [];
    async save(seat: Seat) {
        const seatIndex = this.#seats.findIndex(savedseat =>
            savedseat.id.equals(seat.id),
        );
        if (seatIndex != -1) {
            this.#seats[seatIndex] = seat;
            return;
        }
        this.#seats.push(seat);
    }
    async findOne(seatId: SeatId) {
        return this.#seats.find(seat => seat.id.equals(seatId));
    }
}

export class InMemoryCustomerRepository implements CustomerRepository {
    #customers: Customer[] = [];
    async save(customer: Customer) {
        const customerIndex = this.#customers.findIndex(savedCustomer =>
            savedCustomer.id.equals(customer.id),
        );
        if (customerIndex != -1) {
            this.#customers[customerIndex] = customer;
            return;
        }
        this.#customers.push(customer);
    }
    async findOne(customerId: CustomerId) {
        return this.#customers.find(customer => customer.id.equals(customerId));
    }
}
