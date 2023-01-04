export default abstract class PageAbstract {

    protected constructor() {
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