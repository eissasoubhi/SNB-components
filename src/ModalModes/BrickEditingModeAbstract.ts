import Editor from "../Editor";
import EditableBrick from "../EditableBrick";
import ModalModeAbstract from "./ModalModeAbstract";
import ModalModeInterface from '../Interfaces/Modal/ModalModeInterface';
import DataInterface from "../Interfaces/DataInterface";

export default abstract class BrickEditingModeAbstract extends ModalModeAbstract implements ModalModeInterface {

    private readonly editingBrick: HTMLElement;

    constructor(editingBrick: HTMLElement, editor: Editor) {
        super(editor);
        this.editingBrick = editingBrick
    }

    save(data: DataInterface): void {
        $(this.editingBrick).replaceWith(this.createBrick(data))
    }

    getModalLoadData(): DataInterface {

        let editableBrick = new EditableBrick(this.editingBrick, {
            editableBrickClass: this.editor.editableBrickClass,
        })

        return editableBrick.getBrickData()
    }
}