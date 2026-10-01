import { SeatId } from "../SeatId";
import {
    EventDispatcher,
    EventHandler,
    ReservationPlacedEvent,
    SeatRepository,
} from "../types";

export class ReserveSeatHandler implements EventHandler<ReservationPlacedEvent> {
    constructor(
        readonly seatRepository: SeatRepository,
        readonly eventDispatcher: EventDispatcher,
    ) {}
    async handle(event: ReservationPlacedEvent) {
        const seat = await this.seatRepository.findOne(
            SeatId.fromString(event.seatId),
        );
        if (seat == null) {
            throw new Error("ERR_SEAT_NOT_FOUND");
        }
        seat.reserve();
        await this.seatRepository.save(seat);
        const events = seat.collectDomainEvents();
        for (const event of events) {
            await this.eventDispatcher.dispatch(event);
        }
    }
}
