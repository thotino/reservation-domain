import { describe, expect, it, vi } from "vitest";

import { PlaceReservationUseCase } from "../PlaceReservationUseCase";
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

function createUseCase(seat: Seat | undefined, customer: Customer | undefined) {
    const reservationRepository: ReservationRepository = {
        save: vi.fn(async (_reservation: Reservation) => {}),
        findOneBySeatId: vi.fn(async (_seatId: SeatId) => undefined),
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
        useCase: new PlaceReservationUseCase(
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

describe("PlaceReservationUseCase", () => {
    it("loads the seat and customer, places the reservation, dispatches its event, and saves", async () => {
        const seat = new Seat(new SeatId("A1"));
        const customer = new Customer(new CustomerId("customer-1"));
        const dependencies = createUseCase(seat, customer);

        await dependencies.useCase.execute(seat.id, customer.id);

        expect(dependencies.seatRepository.findOne).toHaveBeenCalledWith(
            seat.id,
        );
        expect(dependencies.customerRepository.findOne).toHaveBeenCalledWith(
            customer.id,
        );
        expect(seat.isFree).toBe(false);
        expect(dependencies.reservationRepository.save).toHaveBeenCalled();
        expect(dependencies.seatRepository.save).toHaveBeenCalled();
        expect(dependencies.reservationRepository.save).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                seatId: seat.id,
                customerId: customer.id,
            }),
        );
        expect(dependencies.seatRepository.save).toHaveBeenCalledWith(seat);
        expect(dependencies.eventDispatcher.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "ReservationPlaced",
                seatId: "A1",
                customerId: "customer-1",
            }),
        );
    });

    it("throws when the customer does not exist and performs no writes or dispatch", async () => {
        const seat = new Seat(new SeatId("A1"));
        const dependencies = createUseCase(seat, undefined);

        await expect(
            dependencies.useCase.execute(seat.id, new CustomerId("missing")),
        ).rejects.toThrow("ERR_CUSTOMER_NOT_FOUND");

        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("throws when the seat does not exist and performs no writes or dispatch", async () => {
        const customer = new Customer(new CustomerId("customer-1"));
        const dependencies = createUseCase(undefined, customer);

        await expect(
            dependencies.useCase.execute(new SeatId("missing"), customer.id),
        ).rejects.toThrow("ERR_SEAT_NOT_FOUND");

        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("propagates the reserved-seat error without saving or dispatching", async () => {
        const seat = new Seat(new SeatId("A1"));
        seat.reserve();
        const customer = new Customer(new CustomerId("customer-1"));
        const dependencies = createUseCase(seat, customer);

        await expect(
            dependencies.useCase.execute(seat.id, customer.id),
        ).rejects.toThrow("ERR_CANNOT_RESERVE_SEAT");

        expect(dependencies.reservationRepository.save).not.toHaveBeenCalled();
        expect(dependencies.seatRepository.save).not.toHaveBeenCalled();
        expect(dependencies.eventDispatcher.dispatch).not.toHaveBeenCalled();
    });
});
