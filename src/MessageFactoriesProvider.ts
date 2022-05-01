import MessagesFactoriesInterface from "./Interfaces/MessagesFactoriesInterface";

export default abstract class MessageFactoriesProvider {

    getMessageFactory(factoryType: string): (message: string) => HTMLElement | null{
        const factories = this.getMessagesFactories()

        if (typeof factories[factoryType] !== 'undefined') {
            return factories[factoryType]
        } else {
            console.error(`${factoryType} is an invalid message factory type`)
            return null
        }
    }

    abstract getMessagesFactories(): MessagesFactoriesInterface
 }