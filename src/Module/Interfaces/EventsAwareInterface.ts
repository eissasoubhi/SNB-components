export default interface EventsAwareInterface {

    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface

    trigger(eventName: string, data: object): EventsAwareInterface
}