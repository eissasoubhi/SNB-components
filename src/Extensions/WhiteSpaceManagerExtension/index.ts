import Editor from "snb-components/src/Editor";
import SnbExtensionInterface from "snb-components/src/Interfaces/SnbExtensionInterface";

export default class WhiteSpaceManagerExtension implements SnbExtensionInterface {

    protected snbRemovableLineBreakClass = 'snb-removable-line-break'
    public readonly name: string = 'whiteSpaceManager'

    onInit(editor: Editor): void {

        const _this = this

        $(editor.editable).on('mouseenter', 'p', function (event) {
            const $p = $(this);

            if (_this.isEmpty($p)) {
                $p.addClass(_this.snbRemovableLineBreakClass)
            }
        })

        $(editor.editable).on('mouseleave', 'p', function (event) {
            const $p = $(this);

            $p.removeClass(_this.snbRemovableLineBreakClass)
        })

        $(editor.editable).on('keyup', function (event) {
            const $focusedP: any = _this.getFocusedLineBreak()

            $(editor.editable).find('p').each(function () {
                const $p = $(this);

                if (_this.isEmpty($p) && $p.is($focusedP)) {

                    $p.addClass(_this.snbRemovableLineBreakClass)
                } else {
                    $p.removeClass(_this.snbRemovableLineBreakClass)
                }
            })
        })

        $(editor.editable).on('click', `p.${this.snbRemovableLineBreakClass}`, function (event) {
            const $p = $(this);

            $p.remove()
        })
    }

    isEmpty($element: JQuery): boolean {
        return $element.text() == ''
    }

    getFocusedLineBreak(): JQuery<Node> {
        const $focused = $(window.getSelection().focusNode)

        return $focused.is('p') ? $focused : $focused.parent()
    }
}