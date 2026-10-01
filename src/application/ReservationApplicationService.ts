import { Customer } from "../domain/Customer";
import { Reservation } from "../domain/Reservation";
import { Seat } from "../domain/Seat";
import {
    EventDispatcher,
    ReservationRepository,
    SeatRepository,
} from "../domain/types";

export class ReservationApplicationService {
    static async handlePlaceReservation(
        seat: Seat,
        customer: Customer,
        reservationRepository: ReservationRepository,
        seatRepository: SeatRepository,
        eventDispatcher: EventDispatcher,
    ) {
        const reservation = await Reservation.place(seat, customer);
        await reservationRepository.save(reservation);
        await seatRepository.save(seat);
        const events = reservation.collectDomainEvents();
        for (const event of events) {
            await eventDispatcher.dispatch(event);
        }
        return reservation;
    }
    static async handleReservationCancellation(
        reservation: Reservation,
        seat: Seat,
        reservationRepository: ReservationRepository,
        seatRepository: SeatRepository,
        eventDispatcher: EventDispatcher,
    ) {
        Reservation.cancel(reservation, seat);
        await reservationRepository.save(reservation);
        await seatRepository.save(seat);
        const events = reservation.collectDomainEvents();
        for (const event of events) {
            await eventDispatcher.dispatch(event);
        }
    }
}
