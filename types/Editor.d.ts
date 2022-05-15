/// <reference types="jquery" />
import EventsAwareInterface from "./Module/Interfaces/EventsAwareInterface";
export default class Editor implements EventsAwareInterface {
    private context;
    readonly editableBrickClass: string;
    readonly styleIdentifier: string;
    readonly blankLineClass: string;
    readonly editable: JQueryStatic;
    private eventManager;
    private snEditor;
    private linebreakManager;
    constructor(context: any);
    insertNode(node: HTMLElement): void;
    insertHtml(html: string): void;
    private attachEvents;
    recoverEditorFocus(): void;
    saveLastFocusedElement(): void;
    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface;
    trigger(eventName: string, data: object): EventsAwareInterface;
    hasStyle(styleIdentifier: string): boolean;
}
//# sourceMappingURL=Editor.d.ts.map