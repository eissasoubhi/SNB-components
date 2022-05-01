 // for JSX rendering
import * as React from "react";
import EditableWrapOptionsInterface from "../Interfaces/Editable/EditableWrapOptionsInterface";

export default (options: EditableWrapOptionsInterface) => {
    return <div contentEditable={false} className={`snb-editable-brick-wrap ${options.editableBrickClass}`}>
        <div className="snb-brick-actions" style={{display: 'none'}}>
            <button type="button" className="snb-remove btn btn-danger">
                <i className="fa fa-times"></i>
            </button>
            <button type="button" className="snb-edit btn btn-success">
                <i className="fa fa-pencil"></i>
            </button>
        </div>
        <div className={options.snbBrickContainerClass}>
        {/*  brick will be added here  */}
        </div>
    </div>
}