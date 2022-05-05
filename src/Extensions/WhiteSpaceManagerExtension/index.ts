import Editor from "../../Editor";
import SnbExtensionInterface from "../../Module/Interfaces/SnbExtensionInterface";
import Utils from "../../Utils";
import ExtensionStyleRenderer from './style'
import LineBreakManager from "../../LineBreak/LineBreakManager";

export default class WhiteSpaceManagerExtension implements SnbExtensionInterface {

    public readonly name: string = 'snbWhiteSpaceManager'
    private linebreakManager: LineBreakManager;

    onInit(editor: Editor): void {

        this.linebreakManager = new LineBreakManager(editor)

        this.addStyleToDOM()

        this.attachEventsToEditor(editor)
    }

    addStyleToDOM() {
        const styleIdentifier = `snb-whitespace-extension-style`

        const extensionStyle = ExtensionStyleRenderer({
            styleIdentifier: styleIdentifier,
            removableLineBreakClass: this.linebreakManager.snbRemovableLineBreakClass,
            removeLineBreakBtnClass: this.linebreakManager.snbRemoveLineBreakBtnClass,
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

        $(editor.editable).on('click', `.${this.linebreakManager.snbRemoveLineBreakBtnClass}`, function () {
            $(this).parent(`p.${_this.linebreakManager.snbRemovableLineBreakClass}`).remove()
        })
    }

    checkLineBreaks(editor: Editor): void {
        const _this = this

        $(editor.editable).find('p').each(function () {
            const $p = $(this);

            if (_this.linebreakManager.isLineBreak($p)) {
                $p.addClass(_this.linebreakManager.snbRemovableLineBreakClass)
            } else {
                $p.removeClass(_this.linebreakManager.snbRemovableLineBreakClass)
            }

            if (_this.linebreakManager.isLineBreak($p) &&
                !_this.linebreakManager.hasRemoveLineBreakBtn($p)) {

                    $p.append(_this.linebreakManager.createLinebreakRemoveBtn())

            } else if(!_this.linebreakManager.isLineBreak($p) &&
                _this.linebreakManager.hasRemoveLineBreakBtn($p)) {

                $p.find(`.${_this.linebreakManager.snbRemoveLineBreakBtnClass}`).remove()

            }
        })
    }
}