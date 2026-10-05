import { SeatId } from "../domain/SeatId";
import {
    ReservationRepository,
    SeatRepository,
    CustomerRepository,
    EventDispatcher,
} from "../domain/types";
import { ReservationApplicationService } from "./ReservationApplicationService";

export class CancelReservationUseCase {
    constructor(
        readonly reservationRepository: ReservationRepository,
        readonly seatRepository: SeatRepository,
        readonly customerRepository: CustomerRepository,
        readonly eventDispatcher: EventDispatcher,
    ) {}
    async execute(seatId: SeatId) {
        const reservation =
            await this.reservationRepository.findOneBySeatId(seatId);
        if (reservation == null) {
            throw new Error("ERR_RESERVATION_NOT_FOUND");
        }
        const customer = await this.customerRepository.findOne(
            reservation.customerId,
        );
        if (customer == null) {
            throw new Error("ERR_CUSTOMER_NOT_FOUND");
        }
        const seat = await this.seatRepository.findOne(seatId);
        if (seat == null) {
            throw new Error("ERR_SEAT_NOT_FOUND");
        }
        await ReservationApplicationService.handleReservationCancellation(
            reservation,
            seat,
            this.reservationRepository,
            this.seatRepository,
            this.eventDispatcher,
        );
    }
}
