import { EventHandler, ReservationCancelledEvent,  } from "../types";

export class SendCancellationEmailHandler implements EventHandler<ReservationCancelledEvent> {
    async handle(event: ReservationCancelledEvent) {
        if(event.customerId == "broken-email") {
            throw new Error("ERR_INCORRECT_CUSTOMER_EMAIL");
        }
        console.log(`Email sent to customer ${event.customerId}`)
    }
}