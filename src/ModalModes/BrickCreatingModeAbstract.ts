import Utils from "../Utils";
import ModalModeAbstract from "./ModalModeAbstract";
import DataInterface from "../Interfaces/DataInterface";
import ModalModeInterface from '../Interfaces/Modal/ModalModeInterface'
import ModalOptionsInterface from "../Interfaces/Modal/ModalOptionsInterface";


export default abstract class BrickCreatingModeAbstract extends ModalModeAbstract implements ModalModeInterface {

    save(data: DataInterface): void {
        if (!this.editor.hasStyle(this.editor.styleIdentifier)) {
            this.editor.insertHtml(this.createStyle(data))
        }

        this.editor.insertNode(this.createBrick(data))
        this.editor.insertHtml(this.createBlankLine(data))
    }

    createStyle(data: DataInterface): string {
        let style = Utils.JSXElementToHTMLElement( this.getBrickStyleTemplate(data) )

        style =  $(style).wrap('<span contenteditable="false"></span>').parent()[0]

        // for an unknown reason, quotes and double-quotes inside the style tags are escaped,
        // here we recover them by replacing the escaped characters.
        // the escaped string must be inserted to the editor as HTML text, not as HTML node, in order for it to work
        return style.outerHTML.replace(/(&quot;)|(&#x27;)/g, '"')
    }

    createBlankLine(data: DataInterface): string {
        return `<p class="${this.editor.blankLineClass} ${data.brickIdentifier}" ><br></p>`
    }

    abstract getModalLoadData(modalOptions: ModalOptionsInterface): DataInterface

    abstract getBrickStyleTemplate(data: DataInterface): JSX.Element
}