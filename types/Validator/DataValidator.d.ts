export default class DataValidator {
    private readonly data;
    private readonly validations;
    private errorBag;
    constructor(data: any, validations: any);
    isValid(): boolean;
    getErrors(): string[];
    protected getRule(name: string): any;
}
//# sourceMappingURL=DataValidator.d.ts.map