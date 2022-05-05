// for JSX rendering
import * as React from "react";
import WhitespaceStyleOptionsInterface from "snb-components/src/Extensions/WhiteSpaceManagerExtension/Interfaces/WhitespaceStyleOptionsInterface";

export default (options: WhitespaceStyleOptionsInterface) => {

    return (
        <style className={options.styleIdentifier}>
            {`
                .${options.removableLineBreakClass} {
                    position: relative;
                    border: 1px solid transparent;
                    -webkit-transition: background .5s ease, border .5s ease;
                    -moz-transition: background .5s ease, border .5s ease;
                    -ms-transition: background .5s ease, border .5s ease;
                    -o-transition: background .5s ease, border .5s ease;
                    transition: background .5s ease, border .5s ease;
                }
                
                .${options.removableLineBreakClass}:hover, 
                .${options.removableLineBreakClass}.highlighted {
                    background-color: #fff8f8;
                    border: 1px solid rgba(185, 1, 1, 0.03);
                }
                
                .${options.removableLineBreakClass}:hover .${options.removeLineBreakBtnClass}:before {
                    content: 'x';
                    position: absolute;
                    left: 0;
                    width: 15px;
                    height: 15px;
                    top: 0;
                    bottom: 0;
                    margin: auto;
                    cursor: pointer;
                    background-color: #fe8282;
                    color: #FFFFFF;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 11px;
                    border-radius: 4px;
                }

            `}
        </style>
    )
}