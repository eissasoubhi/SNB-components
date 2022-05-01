import DataInterface from "../DataInterface";
import ModalOptionsInterface from "./ModalOptionsInterface";

export default interface ModalModeInterface {

    save(data: DataInterface): void

    getModalLoadData(modalOptions: ModalOptionsInterface): DataInterface
}