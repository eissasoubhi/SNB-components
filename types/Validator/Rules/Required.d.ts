import ValidationRuleInterface from "../Interfaces/ValidationRuleInterface";
import ValidationRule from "../ValidationRule";
export default class Required extends ValidationRule implements ValidationRuleInterface {
    isValid(data: any): boolean;
    protected isEmpty(val: any): boolean;
    getErrorMessage(): string;
}
//# sourceMappingURL=Required.d.ts.map