import ErrorBag from "./ErrorBag"
import Required from "./Rules/Required"
import ValidationRuleInterface from "./Interfaces/ValidationRuleInterface"

export default class DataValidator {
    private readonly data: any
    private readonly validations: {[index: string]:any};
    private errorBag: ErrorBag

    constructor(data: any, validations: any) {
        this.data = data
        this.validations = validations
        this.errorBag = new ErrorBag()
    }

    isValid():boolean {
        return !this.getErrors().length
    }

    getErrors(): string[] {
        const errorBag = new ErrorBag()

        for (const dataProperty in this.validations) {
            const propertyValidations = this.validations[dataProperty]

            for (const validationRuleName in propertyValidations) {
                const ValidationRule = this.getRule(validationRuleName)

                const validation = propertyValidations[validationRuleName]
                
                if (!ValidationRule) {
                    continue
                }
                
                const validationRule:ValidationRuleInterface = new ValidationRule(dataProperty, validation.message)

                if (!validationRule.isValid(this.data)) {
                    errorBag.addError(validationRule.getErrorMessage())
                }
            }
        }

        return errorBag.getErrors()
    }

    protected getRule(name: string): any {
        const rules: { [key: string]: any } = {
            'required': Required
        }

        if (!rules[name]) {
            console.error(`${name} is not a defined validation rule`)
            return null
        }

        return rules[name]
    }
}