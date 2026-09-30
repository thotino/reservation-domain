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
    const reservation = await customer.placeReservation(seat);
    await reservationRepository.save(reservation);
    await seatRepository.save(seat);
    const events = reservation.pullEvents();
    for (const event of events) {
      await eventDispatcher.dispatch(event);
    }
    return reservation;
  }
  static async handleReservationCancellation(
    customer: Customer,
    reservation: Reservation,
    seat: Seat,
    eventDispatcher: EventDispatcher,
  ) {
    await customer.cancelReservation(reservation, seat);
    const events = reservation.pullEvents();
    for (const event of events) {
      await eventDispatcher.dispatch(event);
    }
  }
}

