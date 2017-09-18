import {DOCUMENT} from "@angular/common";
import {Inject, Injectable, NgZone} from "@angular/core";
import {EventListenerOption} from "../enum/event-listener-option";
import {NativeEventOption} from "../enum/native-event-option.enum";
import {EventOptionsObject} from "../type/event-options-object";
import {GlobalEventTarget} from "../enum/global-event-target";

@Injectable()
// EventManagerPlugin is not yet part of the public API of Angular, once it is I can remove the `addGlobalEventListener`
export class DomEventOptionsPlugin /*extends EventManagerPlugin*/ {

    private nativeEventObjectSupported: boolean | undefined;

    private readonly nativeOptionsObjects: { [key: string]: AddEventListenerOptions } | any;

    private readonly nativeOptionsSupported: { [key: string]: boolean } | any;
    
    private readonly supportedEvents: [keyof DocumentEventMap] = [
        "abort",
        "activate",
        "beforeactivate",
        "beforedeactivate",
        "blur",
        "canplay",
        "canplaythrough",
        "change",
        "click",
        "contextmenu",
        "dblclick",
        "deactivate",
        "drag",
        "dragend",
        "dragenter",
        "dragleave",
        "dragover",
        "dragstart",
        "drop",
        "durationchange",
        "emptied",
        "ended",
        "error",
        "focus",
        "fullscreenchange",
        "fullscreenerror",
        "input",
        "invalid",
        "keydown",
        "keypress",
        "keyup",
        "load",
        "loadeddata",
        "loadedmetadata",
        "loadstart",
        "mousedown",
        "mousemove",
        "mouseout",
        "mouseover",
        "mouseup",
        "mousewheel",
        "pause",
        "play",
        "playing",
        "pointerlockchange",
        "pointerlockerror",
        "progress",
        "ratechange",
        "readystatechange",
        "reset",
        "scroll",
        "seeked",
        "seeking",
        "select",
        "selectionchange",
        "selectstart",
        "stalled",
        "stop",
        "submit",
        "suspend",
        "timeupdate",
        "touchcancel",
        "touchend",
        "touchmove",
        "touchstart",
        "volumechange",
        "waiting"
    ];

    constructor(private readonly ngZone: NgZone,
                @Inject(DOCUMENT) private readonly doc: Document) {
        this.nativeOptionsSupported = new Object(null);
        this.nativeOptionsObjects = new Object(null);

        this.checkSupport();
    }

    addEventListener(element: HTMLElement, eventName: string, listener: Function): () => void {

        const [type, optionStr]: string[] = eventName.split('.');

        const inZone: boolean = NgZone.isInAngularZone();
        const passive: number = optionStr.indexOf('p') > -1 ? EventListenerOption.Passive : 0;
        const preventDefault: number = optionStr.indexOf('d') > -1 ? EventListenerOption.Default : 0;

        if (passive && preventDefault) {
            throw new Error("EventOptions: You cannot prevent the default behaviour of a passive event. Do not use 'passive (p)' and 'preventDefault (d)' simultaneously");
        }

        const stop: number = optionStr.indexOf('s') > -1 ? EventListenerOption.Stop : 0;
        const once: number = optionStr.indexOf('o') > -1 ? EventListenerOption.Once : 0;
        const noZone: number = optionStr.indexOf('n') > -1 ? EventListenerOption.NoZone : 0;
        const capture: number = optionStr.indexOf('c') > -1 ? EventListenerOption.Capture : 0;

        const bitVal: number = this.getBitValue([capture, noZone, once, passive, stop, preventDefault]);

        // Not really boolean, but we gotta kid TS
        const eventOptionsObj: boolean = this.getEventOptionsObject(bitVal) as boolean;

        const intermediateListener: EventListener = (event: Event) => {
            if (stop) {
                event.stopImmediatePropagation();
            }
            if (preventDefault) {
                event.preventDefault();
            }
            if (once && !this.nativeOptionsSupported[NativeEventOption.Once]) {
                element.removeEventListener(type, intermediateListener, eventOptionsObj);
            }
            if (noZone || !inZone) {
                listener(event);
            } else {
                this.ngZone.run(() => {
                    listener(event);
                });
            }
        };

        if (inZone) {
            this.ngZone.runOutsideAngular(() => {
                element.addEventListener(type, intermediateListener, eventOptionsObj);
            });
        } else {
            element.addEventListener(type, intermediateListener, eventOptionsObj);
        }

        return () => this.ngZone.runOutsideAngular(() => {
            element.removeEventListener(type, intermediateListener, eventOptionsObj);
        });
    }

    addGlobalEventListener(element: GlobalEventTarget, eventName: string, listener: Function): () => void {
        let target: EventTarget|undefined;
        if (element === GlobalEventTarget.Window) {
            target = typeof window !== 'undefined' ? window : undefined;
        } else if (element === GlobalEventTarget.Document) {
            target = this.doc;
        } else if (element === GlobalEventTarget.Body && this.doc) {
            target = this.doc.body;
        } else {
            throw new Error(`Unsupported event target ${element} for event ${eventName}`);
        }
        return this.addEventListener(target as HTMLElement, eventName, listener);
    }

    supports(eventName: string): boolean {
        const [type, optionStr]: string[] = eventName.split('.');
        if (this.supportedEvents.indexOf(type as keyof DocumentEventMap) === -1) {
            return false;
        }
        if (optionStr) {
            return optionStr
            .replace('p', '')
            .replace('c', '')
            .replace('o', '')
            .replace('n', '')
            .replace('s', '')
            .replace('d', '').length === 0;
        }
        return false;
    }

    private checkSupport(): void {
        if (!this.isOptionSupported(NativeEventOption.Capture)) {
            this.nativeEventObjectSupported = false;
        } else {
            this.nativeEventObjectSupported = true;
            this.isOptionSupported(NativeEventOption.Once);
            this.isOptionSupported(NativeEventOption.Passive);
        }
    }

    private getBitValue(options: number[]): number {
        const len: number = options.length;
        let val: number = 0;
        for (let i = 0; i < len; i++) {
            val = val | options[i];
        }
        return val;
    }

    private getEventOptionsObject(options: number): EventOptionsObject {
        if (!this.nativeEventObjectSupported) {
            return (options & EventListenerOption.Capture) !== 0;
        }
        if (options in this.nativeOptionsObjects) {
            return this.nativeOptionsObjects[options];
        }

        const optionsObj: { [key: string]: EventOptionsObject } = {
            capture: (options & EventListenerOption.Capture) !== 0,
            passive: (options & EventListenerOption.Passive) !== 0,
            once: (options & EventListenerOption.Once) !== 0
        };
        this.nativeOptionsObjects[options] = optionsObj;

        return optionsObj;
    }

    private isOptionSupported(option: NativeEventOption): boolean {
        if (option in this.nativeOptionsSupported) {
            return this.nativeOptionsSupported[option];
        } else if (typeof window !== 'undefined') {
            let isSupported: boolean = false;
            try {
                window.addEventListener(option, null as any, Object.defineProperty({}, option, {
                    get: function (): void {
                        isSupported = true
                    }
                }));
            } catch (e) {
            }
            this.nativeOptionsSupported[option] = isSupported;
            return isSupported;
        } else {
            return false;
        }
    }
}