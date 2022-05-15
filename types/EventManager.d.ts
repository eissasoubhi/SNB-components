import EventsAwareInterface from './Module/Interfaces/EventsAwareInterface';
export default class EventManager implements EventsAwareInterface {
    private eventsQueue;
    constructor();
    on(eventName: string, eventHandler: (data: object) => void): EventsAwareInterface;
    trigger(eventName: string, data?: object): this;
    clearAll(): this;
}
//# sourceMappingURL=EventManager.d.ts.map