import Utils from "../../Utils";
import ModalModeAbstract from "./ModalModeAbstract";
import DataInterface from "../Interfaces/DataInterface";
import ModalModeInterface from '../Interfaces/Modal/ModalModeInterface'
import ModalOptionsInterface from "../Interfaces/Modal/ModalOptionsInterface";


export default abstract class BrickCreatingModeAbstract extends ModalModeAbstract implements ModalModeInterface {

    save(data: DataInterface): void {
        if (!this.editor.hasStyle(this.editor.styleIdentifier)) {
            const style = this.createStyle(data)

            if (style) {
                this.editor.insertHtml(style)
            }
        }

        this.editor.insertNode(this.createBrick(data))
        this.editor.insertHtml(this.createBlankLine(data))
    }

    createStyle(data: DataInterface): string {
        const jsxElement = this.getBrickStyleTemplate(data)

        if (!jsxElement) return null

        let style = Utils.JSXElementToHTMLElement(jsxElement)[0]

        style =  $(style).wrap('<span contenteditable="false"></span>').parent()[0]

        return Utils.getEditorInsertableHTML(style)
    }

    createBlankLine(data: DataInterface): string {
        return `<p class="${this.editor.blankLineClass} ${data.brickIdentifier}" ><br></p>`
    }

    abstract getModalLoadData(modalOptions: ModalOptionsInterface): DataInterface

    abstract getBrickStyleTemplate(data: DataInterface): JSX.Element|void
}