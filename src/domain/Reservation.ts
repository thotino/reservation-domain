import { Customer } from "./Customer";
import { CustomerId } from "./CustomerId";
import { Seat } from "./Seat";
import { SeatId } from "./SeatId";
import { ReservationCancelledEvent, ReservationPlacedEvent } from "./types";
enum ReservationStatusEnum {
    ACTIVE = "active",
    CANCELLED = "cancelled",
}
export class Reservation {
    #id: string;
    #seatId: SeatId;
    #customerId: CustomerId;
    #status: ReservationStatusEnum = ReservationStatusEnum.ACTIVE;
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
        const reservation = new Reservation(seatId, customerId);
        reservation.recordPlacementEvent();
        return reservation;
    }
    static cancel(reservation: Reservation, seat: Seat) {
        if (!seat.id.equals(reservation.seatId)) {
            throw new Error("ERR_SEAT_IDS_MISMATCH");
        }
        reservation.cancel();
        reservation.recordCancellationEvent();
        return reservation;
    }
    cancel() {
        if (this.#status != ReservationStatusEnum.ACTIVE) {
            throw new Error("ERR_RESERVATION_NOT_ACTIVE");
        }
        this.#status = ReservationStatusEnum.CANCELLED;
    }
    recordPlacementEvent() {
        this.#pushEvents({
            customerId: this.#customerId.value,
            seatId: this.#seatId.value,
            reservationId: this.#id,
            occurredAt: new Date(),
            name: "ReservationPlaced",
            eventId: crypto.randomUUID(),
        });
    }
    recordCancellationEvent() {
        this.#pushEvents({
            name: "ReservationCancelled",
            customerId: this.#customerId.value,
            occurredAt: new Date(),
            reservationId: this.#id,
            seatId: this.#seatId.value,
            eventId: crypto.randomUUID(),
        });
    }

    #pushEvents(
        ...events: (ReservationPlacedEvent | ReservationCancelledEvent)[]
    ) {
        return this.#events.push(...events);
    }

    collectDomainEvents() {
        return this.#events.splice(0);
    }
}
