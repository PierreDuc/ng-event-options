export type NativeEventOption = 'capture' | 'passive' | 'once';

export module NativeEventOption {
    export const Capture: NativeEventOption = 'capture';
    export const Passive: NativeEventOption = 'passive';
    export const Once: NativeEventOption = 'once';
}

/**
 * TypeError: Cannot create property 'modifierFlagsCache' on string 'capture'
export enum NativeEventOption {
    Capture = 'capture',
    Passive = 'passive',
    Once = 'once'
}
*/