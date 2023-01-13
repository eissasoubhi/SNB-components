/// <reference types="jquery" />
/// <reference types="summernote" />
/// <reference types="react" />
import DataInterface from "./Interfaces/DataInterface";
import ModalInterface from './Interfaces/Modal/ModalInterface';
import EventsAwareInterface from './Interfaces/EventsAwareInterface';
import ModalModeInterface from './Interfaces/Modal/ModalModeInterface';
import ModalOptionsInterface from "./Interfaces/Modal/ModalOptionsInterface";
import MessageFactoriesProvider from "../MessageFactoriesProvider";
export default abstract class ModalAbstract implements ModalInterface, EventsAwareInterface {
    protected $modal: JQuery;
    protected eventManager: EventsAwareInterface;
    protected readonly options: ModalOptionsInterface;
    protected mode: ModalModeInterface;
    protected messagesFactoriesProvider: MessageFactoriesProvider;
    protected constructor(mode: ModalModeInterface, messagesFactoriesProvider: MessageFactoriesProvider, options: ModalOptionsInterface);
    attachEvents(): void;
    open(): void;
    init(): void;
    close(): void;
    createModal(data: DataInterface): JQuery;
    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface;
    trigger(eventName: string, data?: any): EventsAwareInterface;
    showErrors(errors: string[]): void;
    clearMessages(): void;
    getBsModal(): any;
    abstract getBody(): JQuery;
    abstract getSaveButton(): JQuery;
    abstract getData(): DataInterface;
    abstract getMessagesContainer(): JQuery;
    abstract getTemplate(data: DataInterface, options: ModalOptionsInterface): JSX.Element;
}
//# sourceMappingURL=ModalAbstract.d.ts.map