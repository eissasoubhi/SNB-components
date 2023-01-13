import ValidationRuleInterface from "../Interfaces/ValidationRuleInterface"
import ValidationRule from "../ValidationRule"

export default class Required extends ValidationRule implements ValidationRuleInterface{
    public isValid(data: any):boolean {
        return !this.isEmpty(data[this.dataProperty])
    }

    protected isEmpty(val: any): boolean {
        if (Array.isArray(val) && val.length == 0) {
            return true
        }

        return val !== 0 && !val;
    }

    public getErrorMessage(): string {
        if (this.errorMessage != null) {
            return this.errorMessage
        }

        return `${this.dataProperty.toUpperCase()} is required`
    }
}