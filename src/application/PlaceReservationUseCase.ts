import { CustomerId } from "../domain/CustomerId";
import { SeatId } from "../domain/SeatId";
import { ReservationRepository, SeatRepository, CustomerRepository, EventDispatcher } from "../domain/types";
import { ReservationApplicationService } from "./ReservationApplicationService";

export class PlaceReservationUseCase {
  constructor(
    readonly reservationRepository: ReservationRepository,
    readonly seatRepository: SeatRepository,
    readonly customerRepository: CustomerRepository,
    readonly eventDispatcher: EventDispatcher,
  ) {}
  async execute(seatId: SeatId, customerId: CustomerId) {
    const seat = await this.seatRepository.findOne(seatId);
    const customer = await this.customerRepository.findOne(customerId);
    if (customer == null) {
      throw new Error("ERR_CUSTOMER_NOT_FOUND");
    }
    if (seat == null) {
      throw new Error("ERR_SEAT_NOT_FOUND");
    }
    const reservation = await ReservationApplicationService.handlePlaceReservation(
      seat,
      customer,
      this.reservationRepository,
      this.seatRepository,
      this.eventDispatcher,
    );
    await this.reservationRepository.save(reservation)
    await this.seatRepository.save(seat)
  }
}
