export type EventListenerOption = "capture" | "once" | "passive";

export module EventListenerOption {
    export const Capture = "capture";
    export const Once = "once";
    export const Passive = "passive";
}

/**
 * TypeError: Cannot create property 'modifierFlagsCache' on string 'capture'. But why..
 */
/*
 export enum EventListenerOption {
 Capture = "capture",
 Once = "once",
 Passive = "passive"
 }
 */