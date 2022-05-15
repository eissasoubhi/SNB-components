/// <reference types="jquery" />
/// <reference types="summernote" />
import Editor from "../Editor";
import LinebreakSideEnum from "./LinebreakSideEnum";
export default class LineBreakManager {
    protected editor: Editor;
    readonly blankLinebreakClass: string;
    snbRemoveLineBreakBtnClass: string;
    snbRemovableLineBreakClass: string;
    highlightedLinebreakClass: string;
    LinebreakSide: LinebreakSideEnum;
    constructor(editor: Editor);
    removeBlankLinebreak(blankLineIdentifier: string): void;
    isLineBreak($element: JQuery): boolean;
    newLinebreak(highlighted?: boolean): HTMLElement;
    hasRemoveLineBreakBtn($element: JQuery): boolean;
    createLinebreakRemoveBtn(): JQuery;
    unHighlightLinebreak($element: JQuery): void;
    insertLinebreakNearBrick($brick: JQuery, linebreakSide: LinebreakSideEnum): JQuery;
}
//# sourceMappingURL=LineBreakManager.d.ts.map