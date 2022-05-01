import DataInterface from "../DataInterface";

export default interface ModalInterface {

    open(data: DataInterface): void

    close(): void

    getData(): DataInterface
}