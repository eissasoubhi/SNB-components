export default interface MessagesFactoriesInterface {
    [key: string]: (message: string) => HTMLElement
}