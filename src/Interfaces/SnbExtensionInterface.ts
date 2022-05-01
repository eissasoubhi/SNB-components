import Editor from "../Editor";

export default interface SnbExtensionInterface {
    name: string

    onInit(editor: Editor): void
}