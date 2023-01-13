export default class ErrorBag {
    
    private errors: string[] = []
    
    addError(error: string):void {
        if (this.errors.includes(error)) {
            return
        }
        
        this.errors.push(error)
    }
    
    getErrors(): string[] {
        return this.errors
    }
}