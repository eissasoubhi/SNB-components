import { renderToString } from 'react-dom/server'

export default {
    // convert JSX.Element to HTMLElement
    JSXElementToHTMLElement: (JSXElement: JSX.Element): HTMLElement => {
        let html = renderToString(JSXElement)

        return $(html)[0]
    }
}