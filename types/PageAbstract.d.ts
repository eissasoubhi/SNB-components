import PageInterface from "./Module/Interfaces/PageInterface";
export default abstract class PageAbstract implements PageInterface {
    init(): void;
    addStylesToDom(): void;
    addScriptsToDom(): void;
    abstract getStyles(): HTMLElement | HTMLElement[];
    abstract getScripts(): HTMLElement | HTMLElement[];
}
//# sourceMappingURL=PageAbstract.d.ts.map