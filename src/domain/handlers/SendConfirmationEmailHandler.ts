import { EventHandler, ReservationPlacedEvent } from "../types";

export class SendConfirmationEmailHandler implements EventHandler<ReservationPlacedEvent> {
    async handle(event: ReservationPlacedEvent) {
        if(event.customerId == "broken-email") {
            throw new Error("ERR_INCORRECT_CUSTOMER_EMAIL");
        }
        console.log(`Email sent to customer ${event.customerId}`)
    }
}