import { Customer } from "./Customer";
import { CustomerId } from "./CustomerId";
import { Reservation } from "./Reservation";
import { Seat } from "./Seat";
import { SeatId } from "./SeatId";

export interface EventHandler<T> {
  handle(event: T): Promise<void>;
}

export interface EventDispatcher {
  register<T>(eventName: string, handler: EventHandler<T>): void;
  dispatch<T>(event: T): Promise<T>;
}

export interface ReservationRepository {
  save(reservation: Reservation): Promise<void>;
  findOneBySeatId(seatId: SeatId): Promise<Reservation | undefined>;
}
export interface SeatRepository {
  save(seat: Seat): Promise<void>;
  findOne(seatId: SeatId): Promise<Seat | undefined>
}
export interface CustomerRepository {
  save(customer: Customer): Promise<void>;
  findOne(customerId: CustomerId): Promise<Customer | undefined>
}

export interface ReservationPlacedEvent extends Event {
  seatId: string;
  customerId: string;
  reservationId: string;
  occuredAt: Date;
  name: "ReservationPlaced";
}

export interface ReservationCancelledEvent extends Event {
  seatId: string;
  customerId: string;
  reservationId: string;
  occuredAt: Date;
  name: "ReservationCancelled";
}

interface Event {
  name: string;
}
