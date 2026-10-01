export class SeatId {
    readonly value: string;
    constructor(value: string) {
        this.value = value;
    }

    static fromString(rawId: string) {
        return new SeatId(rawId);
    }

    equals(other: SeatId) {
        return this.value === other.value;
    }
}
