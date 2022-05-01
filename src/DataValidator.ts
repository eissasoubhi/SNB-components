export default class DataValidator {
    private readonly data: any
    private readonly validations: {[index: string]:any};

    constructor(data: any, validations: any) {
        this.data = data
        this.validations = validations
    }

    isValid():boolean {
        return !Object.entries( this.getErrors() ).length
    }

    getErrors(): any {
        let errors: any = {}

        for (const dataKey in this.validations) {
            if (this.isEmpty(this.data[dataKey]) && this.isRequired(dataKey)) {
                errors[dataKey] = `${dataKey.toUpperCase()} is required`
            }
        }

        return errors
    }

    protected isEmpty(val: any): boolean {
        if (Array.isArray(val) && val.length == 0) {
            return true
        }

        return val !== 0 && !val;
    }

    protected isRequired(key: any): boolean {
        if (Array.isArray(this.validations[key]) && this.validations[key].length) {
            return this.validations[key].includes('required')
        }

        return false
    }
}