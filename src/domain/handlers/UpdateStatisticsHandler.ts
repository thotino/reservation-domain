import { EventHandler, ReservationPlacedEvent } from "../types";

export class UpdateStatisticsHandler implements EventHandler<ReservationPlacedEvent> {
    #reservedSeats: number = 0;
    async handle(event: ReservationPlacedEvent) {
        this.#reservedSeats++;
    }
}