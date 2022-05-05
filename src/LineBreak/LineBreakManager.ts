import Editor from "../Editor";
import LinebreakSideEnum from "./LinebreakSideEnum";

export default class LineBreakManager {
    protected editor: Editor;
    public readonly blankLinebreakClass: string;
    public snbRemoveLineBreakBtnClass = 'snb-remove-line-break-btn'
    public snbRemovableLineBreakClass = 'snb-removable-line-break'
    public highlightedLinebreakClass = 'highlighted'
    public LinebreakSide: LinebreakSideEnum

    constructor(editor: Editor) {
        this.editor = editor
        this.blankLinebreakClass = `snb-linebreak-${this.editor.editableBrickClass}`
    }


    removeBlankLinebreak(blankLineIdentifier: string):void {
        const $line = $(this.editor.editable).find(`p.${this.blankLinebreakClass}.${blankLineIdentifier}`)

        if ($line.text() == '') {
            $line.remove()
        } else {
            // reset the non-empty line to simple paragraph tag
            $line.removeClass(`${this.blankLinebreakClass} ${blankLineIdentifier}`)
        }
    }

    isLineBreak($element: JQuery): boolean {
        return $element.is('p') && $element.text() == ''
    }

    newLinebreak(highlighted: boolean = false): HTMLElement {
        return $(`<p class="snb-removable-line-break ${highlighted ? this.highlightedLinebreakClass : ''}"><br></p>`)[0];
    }

    hasRemoveLineBreakBtn($element: JQuery): boolean {
        return $element.find(`.${this.snbRemoveLineBreakBtnClass}`).length !== 0
    }

    createLinebreakRemoveBtn(): JQuery {
        return $(`<span class="${this.snbRemoveLineBreakBtnClass}"></span>`)
    }

    unHighlightLinebreak($element: JQuery) {
        $element.removeClass(this.highlightedLinebreakClass)
    }

    insertLinebreakNearBrick($brick: JQuery, linebreakSide: LinebreakSideEnum): JQuery {
        const newLinebreak = this.newLinebreak(true)

        if (linebreakSide == LinebreakSideEnum.Up) {
            $(newLinebreak).insertBefore($brick)
        } else if (linebreakSide == LinebreakSideEnum.Down) {
            $(newLinebreak).insertAfter($brick)
        }

        setTimeout(()=> {
            this.unHighlightLinebreak($(newLinebreak))
        }, 500);

        return $(newLinebreak)
    }
}