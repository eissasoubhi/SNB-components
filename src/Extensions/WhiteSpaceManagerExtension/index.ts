import Editor from "../../Editor";
import SnbExtensionInterface from "../../Module/Interfaces/SnbExtensionInterface";
import Utils from "../../Utils";
import ExtensionStyleRenderer from './style'

export default class WhiteSpaceManagerExtension implements SnbExtensionInterface {

    protected snbRemovableLineBreakClass = 'snb-removable-line-break'
    protected snbRemoveLineBreakBtnClass = 'snb-remove-line-break-btn'
    public readonly name: string = 'whiteSpaceManager'

    onInit(editor: Editor): void {

        this.addStyleToDOM()

        this.attachEventsToEditor(editor)
    }

    addStyleToDOM() {
        const styleIdentifier = `snb-whitespace-extension-style`

        const extensionStyle = ExtensionStyleRenderer({
            styleIdentifier: styleIdentifier,
            removableLineBreakClass: this.snbRemovableLineBreakClass,
            removeLineBreakBtnClass: this.snbRemoveLineBreakBtnClass,
        })

        const style = Utils.JSXElementToHTMLElement(extensionStyle)

        if ($(`.${styleIdentifier}`).length == 0) {
            $('head').append( Utils.getEditorInsertableHTML(style) )
        }
    }

    attachEventsToEditor(editor: Editor) {
       const _this = this
        // @ts-ignore
        const snEditor = editor.editable[0];

        const observer = new MutationObserver(function( mutations ) {

            mutations.forEach(function( mutation ) {

                const $target = $(mutation.target)
                const $nodesList = $(mutation.addedNodes);
                const listHasPNodes = $nodesList.filter('p').length != 0;
                const isNewPTageAdded = mutation.type === 'childList' && $target.is(snEditor) && listHasPNodes

                if (isNewPTageAdded) {
                    _this.checkLineBreaks(editor)
                }

                if(mutation.type === 'characterData') {
                    _this.checkLineBreaks(editor)
                }

            });
        });

        observer.observe(snEditor, {
            subtree: true,
            childList: true,
            characterData: true
        });

        // ====================

        $(editor.editable).on('click', `.${this.snbRemoveLineBreakBtnClass}`, function () {
            $(this).parent(`p.${_this.snbRemovableLineBreakClass}`).remove()
        })
    }

    checkLineBreaks(editor: Editor): void {
        const _this = this

        $(editor.editable).find('p').each(function () {
            const $p = $(this);

            if (_this.isLineBreak($p)) {
                $p.addClass(_this.snbRemovableLineBreakClass)
            } else {
                $p.removeClass(_this.snbRemovableLineBreakClass)
            }

            if (_this.isLineBreak($p) && !_this.hasRemoveLineBreakBtn($p)) {
                    $p.append(`<span class="${_this.snbRemoveLineBreakBtnClass}"></span>`)
            } else if(!_this.isLineBreak($p) && _this.hasRemoveLineBreakBtn($p)) {
                $p.find(`.${_this.snbRemoveLineBreakBtnClass}`).remove()
            }
        })
    }

    isLineBreak($element: JQuery): boolean {
        return $element.is('p') && $element.text() == ''
    }

    hasRemoveLineBreakBtn($element: JQuery): boolean {
        return $element.find(`.${this.snbRemoveLineBreakBtnClass}`).length !== 0
    }
}