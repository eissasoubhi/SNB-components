import SnbExtensionInterface from "./Interfaces/SnbExtensionInterface";

export default class ExtensionsManager {
    private extensions: SnbExtensionInterface[] = []

    add(extension: SnbExtensionInterface) {
        this.extensions.push(extension)
    }

    triggerEvent(eventName: string, params: any[]): void {
        for (let i = 0; i < this.extensions.length; i++) {
            let extension: SnbExtensionInterface = this.extensions[i]
            // @ts-ignore
            let event: any = extension[eventName]

            if (typeof event === 'function') {
                event.apply(extension, params);
            }
        }
    }
}