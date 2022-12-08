import EventsAwareInterface from './Module/Interfaces/EventsAwareInterface'

export default class EventManager implements EventsAwareInterface {
    private eventsQueue: any;

    constructor() {
        // events store
        this.eventsQueue = {};
    }

    // Register an event
    on(eventName: string, eventHandler: (data: object) => void): EventsAwareInterface {
        if (! Array.isArray(this.eventsQueue[eventName]) ) {
            this.eventsQueue[eventName] = [];
        }

        this.eventsQueue[eventName].push(eventHandler);

        return this;
    }

    // Fire an event
    trigger(eventName: string, payload: object = {}) {
        let events = this.eventsQueue[eventName] || [];

        for (let i = 0; i < events.length; i++) {
            events[i].call(null, payload);
        }

        return this;
    }

    clearAll() {
        this.eventsQueue = {};

        return this;
    }
}