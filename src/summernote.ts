export interface SummernoteLayoutInfo {
    editor: JQuery;
    editable: JQuery;
    note?: JQuery;
}

export interface SummernoteContext {
    options: Record<string, any>;
    layoutInfo: SummernoteLayoutInfo;
    memo(key: string): any;
    memo(key: string, value: any): any;
    invoke(namespace: string, ...args: any[]): any;
    triggerEvent?(eventName: string, ...args: any[]): void;
}

export interface SummernoteRenderable {
    render(): JQuery;
}

export interface SummernoteUi {
    button(options: Record<string, any>): SummernoteRenderable;
    buttonGroup(options: Record<string, any> | any[]): SummernoteRenderable;
    dropdown(options: Record<string, any>): SummernoteRenderable;
    dialog(options: Record<string, any>): SummernoteRenderable;
    showDialog(dialog: JQuery): void;
    hideDialog(dialog: JQuery): void;
    onDialogShown(dialog: JQuery, handler: (...args: any[]) => void): void;
    onDialogHidden(dialog: JQuery, handler: (...args: any[]) => void): void;
}

/**
 * Summernote already wraps `editor.insertNode` and `editor.pasteHTML` in its
 * own history command. Use this helper only when a plugin mutates an existing
 * DOM node directly and therefore needs to explicitly participate in
 * Summernote's undo/change lifecycle.
 */
export function mutateWithHistory<T>(context: SummernoteContext, mutation: () => T): T {
    context.invoke('editor.beforeCommand');

    try {
        return mutation();
    } finally {
        context.invoke('editor.afterCommand');
    }
}

export function getSummernoteUi(): SummernoteUi {
    const summernote = ($ as any).summernote;

    if (!summernote || !summernote.ui) {
        throw new Error('Summernote UI is not available. Load Summernote before the plugin.');
    }

    return summernote.ui as SummernoteUi;
}
