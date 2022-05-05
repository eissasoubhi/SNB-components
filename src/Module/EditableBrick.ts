import Utils from "../Utils";
import RenderEditableWrap from "./templates/editableWrapTemplate";
import DataInterface from "./Interfaces/DataInterface";
import EditableBrickOptionsInterface from "./Interfaces/Editable/EditableBrickOptionsInterface";

export default class EditableBrick {
    private readonly brick: HTMLElement;
    private readonly options: EditableBrickOptionsInterface;
    private readonly snbBrickContainerClass: string;

    constructor(brick: HTMLElement, options: EditableBrickOptionsInterface) {
        this.brick = brick
        this.options = options
        this.snbBrickContainerClass = 'sn-brick-container';
    }

    renderBrick(): HTMLElement {
        const editableWrap = RenderEditableWrap({
            editableBrickClass: this.options.editableBrickClass,
            snbBrickContainerClass: this.snbBrickContainerClass,
            showLinebreaksButtons: true
        })

        const editableBrick = Utils.JSXElementToHTMLElement(editableWrap)

        $(editableBrick).find(`.${this.snbBrickContainerClass}`).append(this.brick)

        return editableBrick
    }

    getBrickData(): DataInterface {
        return $(this.brick).find('[data-brickdata]').data('brickdata')
    }
}