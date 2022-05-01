import ModalOptionsInterface from "../Modal/ModalOptionsInterface";

export default interface SummernotePluginOptionsInterface {

    modal?: ModalOptionsInterface

    buttonLabel?: string

    tooltip?: string

    extensions?: string[]
}