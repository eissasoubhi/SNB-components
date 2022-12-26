/// <reference types="react" />
import ModalModeAbstract from "./ModalModeAbstract";
import DataInterface from "../Interfaces/DataInterface";
import ModalModeInterface from '../Interfaces/Modal/ModalModeInterface';
import ModalOptionsInterface from "../Interfaces/Modal/ModalOptionsInterface";
export default abstract class BrickCreatingModeAbstract extends ModalModeAbstract implements ModalModeInterface {
    save(data: DataInterface): void;
    createStyle(data: DataInterface): string;
    createBlankLine(data: DataInterface): string;
    abstract getModalLoadData(modalOptions: ModalOptionsInterface): DataInterface;
    abstract getBrickStyleTemplate(data: DataInterface): JSX.Element|void;
}
//# sourceMappingURL=BrickCreatingModeAbstract.d.ts.map