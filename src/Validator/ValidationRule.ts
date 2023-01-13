export default class ValidationRule {
    constructor(public dataProperty: string, public errorMessage: string|null|undefined) {
    }
}