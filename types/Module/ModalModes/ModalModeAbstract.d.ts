/// <reference types="react" />
import Editor from "../../Editor";
import DataInterface from "../Interfaces/DataInterface";
export default abstract class ModalModeAbstract {
    protected editor: Editor;
    constructor(editor: Editor);
    createBrick(data: DataInterface): HTMLElement;
    abstract getBrickTemplate(data: DataInterface): JSX.Element;
}
//# sourceMappingURL=ModalModeAbstract.d.ts.map