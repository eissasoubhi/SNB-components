import Utils from "../Utils";
import EventManager from "../EventManager";
import DataValidator from "../DataValidator";
import DataInterface from "./Interfaces/DataInterface";
import ModalInterface from './Interfaces/Modal/ModalInterface'
import EventsAwareInterface from './Interfaces/EventsAwareInterface'
import ModalModeInterface from './Interfaces/Modal/ModalModeInterface'
import ModalOptionsInterface from "./Interfaces/Modal/ModalOptionsInterface";
import MessageFactoriesProvider from "../MessageFactoriesProvider";


export default abstract class ModalAbstract implements ModalInterface, EventsAwareInterface{
    protected $modal: JQuery;
    protected eventManager: EventsAwareInterface;
    protected readonly options: ModalOptionsInterface;
    protected mode: ModalModeInterface;
    protected messagesFactoriesProvider: MessageFactoriesProvider;

    protected constructor(mode: ModalModeInterface, messagesFactoriesProvider: MessageFactoriesProvider, options: ModalOptionsInterface) {

        this.options = options

        this.mode = mode;

        this.messagesFactoriesProvider = messagesFactoriesProvider;

        this.eventManager = new EventManager();
    }

    attachEvents() {
        let _this = this;

        this.getSaveButton().on('click',function(event) {

            const validator = new DataValidator(_this.getData(), _this.options.validations)

            _this.clearMessages()

            if (!validator.isValid()) {
                _this.showErrors(validator.getErrors())
                return
            }

            _this.close()

            _this.trigger('beforeSave');

            _this.mode.save(_this.getData())

            _this.trigger('save', {data: _this.getData()});

            _this.trigger('afterSave');
        });
    }

    open():void {
        this.$modal = this.createModal(this.mode.getModalLoadData(this.options));

        this.attachEvents();

        (this.$modal as any).modal();
    }

    close():void {
        (this.$modal as any).modal('hide');
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

    showErrors(errors: any): void {

        const errorMessageFactory = this.messagesFactoriesProvider.getMessageFactory('error')

        if (!errorMessageFactory) {
            return
        }

        for (const errorKey in errors) {
            const messageNode = errorMessageFactory(errors[errorKey])

            this.getMessagesContainer().append(messageNode)
        }
    }

    clearMessages():void {
        this.getMessagesContainer().html('')
    }

    abstract getBody(): JQuery

    abstract getSaveButton(): JQuery

    abstract  getData(): DataInterface

    abstract getMessagesContainer(): JQuery

    abstract getTemplate(data: DataInterface, options: ModalOptionsInterface): JSX.Element

}