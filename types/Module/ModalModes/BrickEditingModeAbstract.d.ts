import Editor from "../../Editor";
import ModalModeAbstract from "./ModalModeAbstract";
import ModalModeInterface from '../Interfaces/Modal/ModalModeInterface';
import DataInterface from "../Interfaces/DataInterface";
export default abstract class BrickEditingModeAbstract extends ModalModeAbstract implements ModalModeInterface {
    private readonly editingBrick;
    constructor(editingBrick: HTMLElement, editor: Editor);
    save(data: DataInterface): void;
    getModalLoadData(): DataInterface;
}
//# sourceMappingURL=BrickEditingModeAbstract.d.ts.map