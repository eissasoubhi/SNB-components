import Utils from "../Utils";
import Editor from "../Editor";
import EditableBrick from "../EditableBrick";
import DataInterface from "../Interfaces/DataInterface";

export default abstract class ModalModeAbstract {

    protected editor: Editor;

    constructor(editor: Editor) {
        this.editor = editor
    }

    createBrick(data: DataInterface): HTMLElement {

        const newBrick = Utils.JSXElementToHTMLElement( this.getBrickTemplate(data) )

        const editableBrick = new EditableBrick(newBrick, {
            editableBrickClass: this.editor.editableBrickClass
        })

        return editableBrick.renderBrick()
    }

    abstract getBrickTemplate(data: DataInterface): JSX.Element
 }