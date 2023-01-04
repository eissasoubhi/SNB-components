import PageInterface from "./Module/Interfaces/PageInterface";

export default abstract class PageAbstract implements PageInterface{

    init() {
        this.addStylesToDom()
        this.addScriptsToDom()
    }

    addStylesToDom() {
        $('head').append(this.getStyles())
    }

    addScriptsToDom() {
        $('body').append(this.getScripts())
    }

    abstract getStyles(): HTMLElement|HTMLElement[]

    abstract getScripts(): HTMLElement|HTMLElement[]
}