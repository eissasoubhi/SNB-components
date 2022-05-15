import Editor from "../../Editor";
import SnbExtensionInterface from "../../Module/Interfaces/SnbExtensionInterface";
export default class WhiteSpaceManagerExtension implements SnbExtensionInterface {
    readonly name: string;
    private linebreakManager;
    onInit(editor: Editor): void;
    addStyleToDOM(): void;
    attachEventsToEditor(editor: Editor): void;
    checkLineBreaks(editor: Editor): void;
}
//# sourceMappingURL=index.d.ts.map