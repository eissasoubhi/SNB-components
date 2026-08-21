import Utils from "../Utils";
import EventManager from "../EventManager";
import DataValidator from "../Validator/DataValidator";
import DataInterface from "./Interfaces/DataInterface";
import ModalInterface from './Interfaces/Modal/ModalInterface'
import EventsAwareInterface from './Interfaces/EventsAwareInterface'
import ModalModeInterface from './Interfaces/Modal/ModalModeInterface'
import ModalOptionsInterface from "./Interfaces/Modal/ModalOptionsInterface";
import MessageFactoriesProvider from "../MessageFactoriesProvider";


export default abstract class ModalAbstract implements ModalInterface, EventsAwareInterface{
    protected $modal!: JQuery;
    protected eventManager: EventsAwareInterface;
    protected readonly options: ModalOptionsInterface;
    protected mode: ModalModeInterface;
    protected messagesFactoriesProvider: MessageFactoriesProvider;

    protected constructor(mode: ModalModeInterface, messagesFactoriesProvider: MessageFactoriesProvider, options: ModalOptionsInterface) {

        this.options = options
        this.mode = mode;
        this.messagesFactoriesProvider = messagesFactoriesProvider;
        this.eventManager = new EventManager();

        this.init()
    }

    attachEvents() {
        this.getSaveButton().on('click',(event) => {

            const validator = new DataValidator(this.getData(), this.options.validations)

            this.clearMessages()

            if (!validator.isValid()) {
                this.showErrors(validator.getErrors())
                return
            }

            this.close()

            this.trigger('beforeSave');

            this.mode.save(this.getData())

            this.trigger('save', {data: this.getData()});

            this.trigger('afterSave');
        });
    }

    open():void {
        this.getBsModal().modal();
    }

    init(): void {
        this.$modal = this.createModal(this.mode.getModalLoadData(this.options));

        this.attachEvents();
    }

    close():void {
        this.getBsModal().modal('hide')
    }

    createModal(data: DataInterface): JQuery {
        const modalJSX = this.getTemplate(data, this.options)
        return $( Utils.JSXElementToHTMLElement(modalJSX) ).hide();
    }

    on(eventName: string, eventHandler: (data: unknown) => void): EventsAwareInterface {
        return this.eventManager.on(eventName, eventHandler);
    }

    trigger(eventName: string, data: any = {}): EventsAwareInterface {
        return this.eventManager.trigger(eventName, data) ;
    }

    showErrors(errors: string[]): void {

        const errorMessageFactory = this.messagesFactoriesProvider.getMessageFactory('error')

        if (!errorMessageFactory) {
            return
        }

        for (let i = 0; i < errors.length; i++) {
            const messageNode = errorMessageFactory(errors[i])

            if (messageNode) {
                this.getMessagesContainer().append(messageNode)
            }
        }
    }

    clearMessages():void {
        this.getMessagesContainer().html('')
    }

    getBsModal(): any {
        return this.$modal
    }

    abstract getBody(): JQuery

    abstract getSaveButton(): JQuery

    abstract  getData(): DataInterface

    abstract getMessagesContainer(): JQuery

    abstract getTemplate(data: DataInterface, options: ModalOptionsInterface): JSX.Element

}