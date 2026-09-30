import { EventHandler, Event } from "./types";
type EventName = "name"
export class EventDispatcher {
    #handlers: Map<string, EventHandler<unknown>[]> = new Map();

    register<T extends Event>(eventName: T[EventName], handler: EventHandler<T>) {
        if(!this.#handlers.has(eventName)) {
            this.#handlers.set(eventName, [])
        }
        this.#handlers.get(eventName)?.push(handler);
    }
    async dispatch<T extends Event>(event: T) {
        const registeredHandlers = this.#handlers.get(event.name) ?? []
        for (const handler of registeredHandlers) {
            try {
                await handler.handle(event);
            } catch (error) {
                console.error("[Dispatcher error]", error)
            }
        }
    }

}