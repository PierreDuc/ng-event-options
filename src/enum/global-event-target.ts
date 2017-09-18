export type GlobalEventTarget = 'window' | 'document' | 'body';

export module GlobalEventTarget {
    export const Window: GlobalEventTarget = 'window';
    export const Document: GlobalEventTarget = 'document';
    export const Body: GlobalEventTarget = 'body';
}

/**
 * TypeError: Cannot create property 'modifierFlagsCache' on string 'window'
 export enum GlobalEventTarget {
    Window = 'window',
    Document = 'document',
    Body = 'body'
}
 */