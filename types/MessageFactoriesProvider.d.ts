import MessagesFactoriesInterface from "./Module/Interfaces/MessagesFactoriesInterface";
export default abstract class MessageFactoriesProvider {
    getMessageFactory(factoryType: string): (message: string) => HTMLElement | null;
    abstract getMessagesFactories(): MessagesFactoriesInterface;
}
//# sourceMappingURL=MessageFactoriesProvider.d.ts.map