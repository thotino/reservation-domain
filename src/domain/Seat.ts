import { SeatId } from "./SeatId";

export class Seat {
  #id: SeatId;
  #isFree: boolean = true;
  constructor(id: SeatId) {
    this.#id = id;
  }
  get id() {
    return this.#id;
  }
  get isFree() {
    return this.#isFree;
  }
  reserve() {
    if (this.#isFree == true) {
      this.#isFree = false;
      return;
    }
    throw new Error("ERR_SEAT_ALREADY_RESERVED");
  }
  unreserve() {
    if (this.#isFree == false) {
      this.#isFree = true;
      return;
    }
    throw new Error("ERR_SEAT_ALREADY_FREED");
  }
}
