export default class DataValidator {
    private readonly data;
    private readonly validations;
    constructor(data: any, validations: any);
    isValid(): boolean;
    getErrors(): any;
    protected isEmpty(val: any): boolean;
    protected isRequired(key: any): boolean;
}
//# sourceMappingURL=DataValidator.d.ts.map