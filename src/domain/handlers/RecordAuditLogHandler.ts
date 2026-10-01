import { EventHandler, ReservationPlacedEvent } from "../types";

export class RecordAuditLogHandler implements EventHandler<ReservationPlacedEvent> {
    async handle(event: ReservationPlacedEvent) {
        console.log(
            `Reservation for seat ${event.seatId} placed by customer ${event.customerId}`,
        );
    }
}
