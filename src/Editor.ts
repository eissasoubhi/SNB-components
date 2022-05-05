import EventManager from "./EventManager";
import EventsAwareInterface from "./Module/Interfaces/EventsAwareInterface";
import LineBreakManager from "./LineBreak/LineBreakManager";
import LinebreakSideEnum from "./LineBreak/LinebreakSideEnum";

export default class Editor implements EventsAwareInterface{
    private context: any;
    readonly editableBrickClass: string;
    readonly styleIdentifier: string
    readonly blankLineClass: string
    public readonly editable: JQueryStatic;
    private eventManager: EventManager;
    private snEditor: JQueryStatic;
    private linebreakManager: LineBreakManager;

    constructor(context: any) {
        this.context = context
        this.editableBrickClass = 'snb-heading-brick';
        this.styleIdentifier = `snb-style-${this.editableBrickClass}`
        this.editable = context.layoutInfo.editable
        this.snEditor = context.layoutInfo.editor
        this.eventManager = new EventManager()
        this.linebreakManager = new LineBreakManager(this)

        this.attachEvents()
    }

    insertNode(node: HTMLElement) {
        this.context.invoke('editor.insertNode', node);
    }

    insertHtml(html: string) {
        this.context.invoke('editor.pasteHTML', html);
    }

    private attachEvents() {
        let _this = this;

        $(this.editable).on('click', `.${this.editableBrickClass} .snb-brick-actions .snb-remove `, function() {
            let $brick = $(this).parents(`.${_this.editableBrickClass}`)

            $brick.remove()

            _this.trigger('brick-removed', $brick.get(0))
        })

        $(this.editable).on('click', `.${this.editableBrickClass} .snb-brick-actions .snb-edit `, function() {
            let $brick = $(this).parents(`.${_this.editableBrickClass}`)

            _this.trigger('brick-editing', $brick.get(0))
        })

        $(this.editable).on('click', `.${this.editableBrickClass} .snb-linebreaks .snb-linebreak-up `, function() {
            const $brick = $(this).parents(`.${_this.editableBrickClass}`)

            const $insertedLinebreak = _this.linebreakManager.insertLinebreakNearBrick($brick, LinebreakSideEnum.Up)

            _this.trigger('new-linebreak-added-up', $insertedLinebreak)
        })

        $(this.editable).on('click', `.${this.editableBrickClass} .snb-linebreaks .snb-linebreak-down `, function() {
            const $brick = $(this).parents(`.${_this.editableBrickClass}`)

            const $insertedLinebreak = _this.linebreakManager.insertLinebreakNearBrick($brick, LinebreakSideEnum.Down)

            _this.trigger('new-linebreak-added-down', $insertedLinebreak)
        })

    }

    // set the focus to the last focused element in the editor
    recoverEditorFocus() {
        let lastFocusedEl = $(this.snEditor).data('last_focused_element');

        if(typeof lastFocusedEl !== "undefined") {
            let editor = this.editable;
            let range = document.createRange();
            let sel = window.getSelection();
            let cursor_position =  lastFocusedEl.length;

            range.setStart(lastFocusedEl, cursor_position);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            (editor as any).focus();
        }
    }

    saveLastFocusedElement() {
        let focusedElement: Node = window.getSelection().focusNode;
        let parent = $(this.editable).get(0);
        if ($.contains(parent, <Element>focusedElement)) {
            $(this.snEditor).data('last_focused_element', focusedElement)
        }
    }

    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface {
        return this.eventManager.on(eventName, eventHandler);
    }

    trigger(eventName: string, data: object): EventsAwareInterface {
        return this.eventManager.trigger(eventName, data);
    }

    hasStyle(styleIdentifier: string): boolean {
        return !!$(this.editable).find(`style.${styleIdentifier}`).length
    }
}