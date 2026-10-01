import { SeatId } from "../SeatId";
import {
    EventDispatcher,
    EventHandler,
    ReservationCancelledEvent,
    SeatRepository,
} from "../types";

export class CancelSeatReservationHandler implements EventHandler<ReservationCancelledEvent> {
    constructor(
        readonly seatRepository: SeatRepository,
        readonly eventDispatcher: EventDispatcher,
    ) {}
    async handle(event: ReservationCancelledEvent): Promise<void> {
        const seat = await this.seatRepository.findOne(
            SeatId.fromString(event.seatId),
        );
        if (seat == null) {
            throw new Error("ERR_SEAT_NOT_FOUND");
        }
        seat.unreserve();
        await this.seatRepository.save(seat);
        const events = seat.collectDomainEvents();
        for (const event of events) {
            await this.eventDispatcher.dispatch(event);
        }
    }
}
