export default interface ValidationRuleInterface {
    isValid(data: any): boolean
    getErrorMessage(): string
}