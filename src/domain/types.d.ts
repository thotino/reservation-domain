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
    findOne(seatId: SeatId): Promise<Seat | undefined>;
}
export interface CustomerRepository {
    save(customer: Customer): Promise<void>;
    findOne(customerId: CustomerId): Promise<Customer | undefined>;
}
export interface SeatReservedEvent extends Event {
    readonly name: "SeatReserved";
    readonly seatId: string;
}
export interface SeatReservationCancelledEvent extends Event {
    readonly name: "SeatReservationCancelled";
    readonly seatId: string;
}
export interface ReservationPlacedEvent extends Event {
    readonly seatId: string;
    readonly customerId: string;
    readonly reservationId: string;
    readonly name: "ReservationPlaced";
}

export interface ReservationCancelledEvent extends Event {
    readonly seatId: string;
    readonly customerId: string;
    readonly reservationId: string;
    readonly name: "ReservationCancelled";
}

interface Event {
    readonly name: string;
    readonly eventId: string;
    readonly occurredAt: Date;
}
