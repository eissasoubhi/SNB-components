import { renderToString } from 'react-dom/server'

export default {
    // convert JSX.Element to HTMLElement
    JSXElementToHTMLElement: (JSXElement: JSX.Element): HTMLElement => {
        let html = renderToString(JSXElement)

        return $(html)[0]
    },

    getEditorInsertableHTML(style: HTMLElement) {

        // for an unknown reason, quotes and double-quotes inside the style tags are escaped,
        // here we recover them by replacing the escaped characters.
        // the escaped string must be inserted to the editor as HTML text, not as HTML node, in order for it to work
        return style.outerHTML.replace(/(&quot;)|(&#x27;)/g, '"')
    }
}