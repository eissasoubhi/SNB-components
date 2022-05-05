 // for JSX rendering
import * as React from "react";
import EditableWrapOptionsInterface from "../Interfaces/Editable/EditableWrapOptionsInterface";

export default (options: EditableWrapOptionsInterface) => {
    return <div contentEditable={false} className={`snb-editable-brick-wrap ${options.editableBrickClass}`}>
        <div className="snb-brick-actions" style={{display: 'none'}}>
            <div className="snb-crud-actions">
                <button type="button" className="snb-remove btn btn-danger">
                    <i className="fa fa-times"></i>
                </button>
                <button type="button" className="snb-edit btn btn-success">
                    <i className="fa fa-pencil"></i>
                </button>
            </div>
            {   options.showLinebreaksButtons &&
                <div className="btn-group snb-linebreaks" role="group" aria-label="">
                  <button type="button" className="btn btn-light snb-linebreak-up">
                      <i className="fa fa-arrow-up" aria-hidden="true"></i>
                  </button>
                  <button type="button" className="btn btn-light snb-linebreak-down">
                      <i className="fa fa-arrow-down" aria-hidden="true"></i>
                  </button>
                </div>
            }

        </div>
        <div className={options.snbBrickContainerClass}>
        {/*  brick will be added here  */}
        </div>
    </div>
}