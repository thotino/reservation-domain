import {
    EventHandler,
    SeatReservationCancelledEvent,
    SeatReservedEvent,
} from "../types";

export class UpdateStatisticsHandler implements EventHandler<
    SeatReservedEvent | SeatReservationCancelledEvent
> {
    #reservedSeats: number = 0;
    async handle(event: SeatReservedEvent | SeatReservationCancelledEvent) {
        switch (event.name) {
            case "SeatReserved":
                this.#reservedSeats++;
                break;
            case "SeatReservationCancelled":
                this.#reservedSeats--;
                break;
            default:
                throw new Error("ERR_UNKNOWN_EVENT_NAME");
        }
    }
}
