import DataInterface from "./Interfaces/DataInterface";
import EditableBrickOptionsInterface from "./Interfaces/Editable/EditableBrickOptionsInterface";
export default class EditableBrick {
    private readonly brick;
    private readonly options;
    private readonly snbBrickContainerClass;
    constructor(brick: HTMLElement, options: EditableBrickOptionsInterface);
    renderBrick(): HTMLElement;
    getBrickData(): DataInterface;
}
//# sourceMappingURL=EditableBrick.d.ts.map