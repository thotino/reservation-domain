import { Customer } from "./Customer";
import { CustomerId } from "./CustomerId";
import { Seat } from "./Seat";
import { SeatId } from "./SeatId";
import { ReservationCancelledEvent, ReservationPlacedEvent } from "./types";

export class Reservation {
  #id: string;
  #seatId: SeatId;
  #customerId: CustomerId;
  #events: (ReservationPlacedEvent | ReservationCancelledEvent)[] = [];
  constructor(seatId: SeatId, customerId: CustomerId) {
    this.#id = crypto.randomUUID();
    this.#seatId = seatId;
    this.#customerId = customerId;
  }
  get id() {
    return this.#id;
  }
  get seatId() {
    return this.#seatId;
  }
  get customerId() {
    return this.#customerId;
  }
  static place(seat: Seat, customer: Customer) {
    const seatId = seat.id;
    const customerId = customer.id;
    seat.reserve();
    const reservation = new Reservation(seatId, customerId);
    reservation.pushEvents({
      customerId: customerId.value,
      seatId: seatId.value,
      reservationId: reservation.id,
      occuredAt: new Date(),
      name: "ReservationPlaced",
    });
    return reservation;
  }
  static cancel(reservation: Reservation, seat: Seat) {
    if(!seat.id.equals(reservation.seatId)) {
      throw new Error("ERR_SEAT_IDS_MISMATCH")
    }
    seat.unreserve();
    reservation.pushEvents({
      name: "ReservationCancelled",
      customerId: reservation.customerId.value,
      occuredAt: new Date(),
      reservationId: reservation.id,
      seatId: reservation.seatId.value,
    });
    return reservation
  }

  pushEvents(
    ...events: (ReservationPlacedEvent | ReservationCancelledEvent)[]
  ) {
    return this.#events.push(...events);
  }

  pullEvents() {
    return this.#events.splice(0);
  }
}
