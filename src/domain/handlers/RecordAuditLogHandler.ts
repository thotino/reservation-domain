import { EventHandler, ReservationPlacedEvent } from "../types";

export class RecordAuditLogHandler implements EventHandler<ReservationPlacedEvent> {
    async handle(event: ReservationPlacedEvent) {
        console.log(`Seat ${event.seatId} reserved by customer ${event.customerId}`)
    }
}