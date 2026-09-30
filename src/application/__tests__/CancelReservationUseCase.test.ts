import { describe, expect, it, vi } from "vitest";

import { CancelReservationUseCase } from "../CancelReservationUseCase";
import { Customer } from "../../domain/Customer";
import { CustomerId } from "../../domain/CustomerId";
import { Reservation } from "../../domain/Reservation";
import { Seat } from "../../domain/Seat";
import { SeatId } from "../../domain/SeatId";
import type {
    CustomerRepository,
    EventDispatcher,
    ReservationRepository,
    SeatRepository,
} from "../../domain/types";

function createUseCase(
    reservation: Reservation | undefined,
    customer: Customer | undefined,
    seat: Seat | undefined,
) {
    const reservationRepository: ReservationRepository = {
        findOneBySeatId: vi.fn(async (_seatId: SeatId) => reservation),
        save: vi.fn(async (_reservation: Reservation) => {}),
    };
    const seatRepository: SeatRepository = {
        findOne: vi.fn(
            async (_seatId: SeatId): Promise<Seat | undefined> => seat,
        ),
        save: vi.fn(async (_seat: Seat) => {}),
    };
    const customerRepository: CustomerRepository = {
        findOne: vi.fn(
            async (_customerId: CustomerId): Promise<Customer | undefined> =>
                customer,
        ),
        save: vi.fn(async (_customer: Customer) => {}),
    };
    const eventDispatcher: EventDispatcher = {
        register: vi.fn(),
        dispatch: vi.fn(async <T>(event: T) => event),
    };

    return {
        useCase: new CancelReservationUseCase(
            reservationRepository,
            seatRepository,
            customerRepository,
            eventDispatcher,
        ),
        reservationRepository,
        seatRepository,
        customerRepository,
        eventDispatcher,
    };
}

describe("CancelReservationUseCase", () => {
    it("loads the reservation, customer, and seat, dispatches cancellation, and saves both aggregates", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seat = new Seat(new SeatId("A1"));
        const reservation = Reservation.place(seat, customer);
        reservation.pullEvents();
        const dependencies = createUseCase(reservation, customer, seat);

        await dependencies.useCase.execute(seat.id);

        expect(
            dependencies.reservationRepository.findOneBySeatId,
        ).toHaveBeenCalledWith(seat.id);
        expect(dependencies.customerRepository.findOne).toHaveBeenCalledWith(
            reservation.customerId,
        );
        expect(dependencies.seatRepository.findOne).toHaveBeenCalledWith(
            seat.id,
        );
        expect(seat.isFree).toBe(true);
        expect(dependencies.seatRepository.save).toHaveBeenCalledWith(seat);
        expect(dependencies.reservationRepository.save).toHaveBeenCalledWith(
            reservation,
        );
        expect(dependencies.eventDispatcher.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "ReservationCancelled",
                reservationId: reservation.id,
                seatId: "A1",
                customerId: "customer-1",
            }),
        );
    });

    it("throws when the reservation does not exist and skips later lookups and effects", async () => {
        const dependencies = createUseCase(undefined, undefined, undefined);

        await expect(
            dependencies.useCase.execute(new SeatId("missing")),
        ).rejects.toThrow("ERR_RESERVATION_NOT_FOUND");

        expect(dependencies.customerRepository.findOne).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.findOne).not.toHaveBeenCalled();
        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("throws when the reservation customer does not exist and skips seat lookup and effects", async () => {
        const seat = new Seat(new SeatId("A1"));
        const reservation = new Reservation(seat.id, new CustomerId("missing"));
        const dependencies = createUseCase(reservation, undefined, seat);

        await expect(dependencies.useCase.execute(seat.id)).rejects.toThrow(
            "ERR_CUSTOMER_NOT_FOUND",
        );

        expect(dependencies.seatRepository.findOne).not.toHaveBeenCalled();
        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("throws when the seat does not exist and performs no writes or dispatch", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const seatId = new SeatId("A1");
        const reservation = new Reservation(seatId, customer.id);
        const dependencies = createUseCase(reservation, customer, undefined);

        await expect(dependencies.useCase.execute(seatId)).rejects.toThrow(
            "ERR_SEAT_NOT_FOUND",
        );

        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("rejects a reservation whose seat identifier differs from the requested seat", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const reservedSeat = new Seat(new SeatId("A1"));
        const reservation = Reservation.place(reservedSeat, customer);
        reservation.pullEvents();
        const differentSeat = new Seat(new SeatId("A2"));
        differentSeat.reserve();
        const dependencies = createUseCase(
            reservation,
            customer,
            differentSeat,
        );

        await expect(
            dependencies.useCase.execute(reservedSeat.id),
        ).rejects.toThrow("ERR_SEAT_IDS_MISMATCH");

        expect(differentSeat.isFree).toBe(false);
        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });
});
