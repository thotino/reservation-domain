export class CustomerId {
    readonly value: string;
    constructor(value: string) {
        this.value = value
    }
    
    static fromString(rawId: string) {
        return new CustomerId(rawId);
    }

    equals(other: CustomerId) {
        return this.value === other.value
    }
}