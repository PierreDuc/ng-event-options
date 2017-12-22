import {Inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';

import {ErrorMsg} from '../enum/error-msg.enum';
import {EventOption} from '../enum/event-option.enum';
import {GlobalEventTarget} from '../enum/global-event-target.enum';
import {NativeEventOption} from '../enum/native-event-option.enum';
import {OptionSymbol} from '../enum/option-symbol.enum';

import {EventOptionsObject} from '../type/event-options-object';

@Injectable()
// EventManagerPlugin is not yet part of the public API of Angular, once it is I can remove the `addGlobalEventListener`
export class DomEventOptionsPlugin /*extends EventManagerPlugin*/ {

    private nativeEventObjectSupported?: boolean;

    private readonly nativeOptionsObjects: { [key: string]: AddEventListenerOptions } = {};

    private readonly nativeOptionsSupported: { [key: string]: boolean } = {};

    private readonly keyEvents: [keyof DocumentEventMap] = ['keydown', 'keypress', 'keyup'];

    constructor(private readonly ngZone: NgZone,
                @Inject(DOCUMENT) private readonly doc: any,
                @Inject(PLATFORM_ID) private readonly platformId: Object) {
        this.checkSupport();
    }

    addEventListener(element: HTMLElement, eventName: string, listener: EventListener): () => void {
        const [type, options]: string[] = eventName.split('.');
        const inBrowser: number = options.indexOf(OptionSymbol.InBrowser) > -1 ? EventOption.InBrowser : 0;

        if (inBrowser && !isPlatformBrowser(this.platformId)) {
            return () => {
            };
        }

        const passive: number = options.indexOf(OptionSymbol.Passive) > -1 ? EventOption.Passive : 0;
        const preventDefault: number = options.indexOf(OptionSymbol.PreventDefault) > -1 ? EventOption.PreventDefault : 0;

        if (passive && preventDefault) {
            throw new Error(ErrorMsg.PassivePreventDefault);
        }

        const stop: number = options.indexOf(OptionSymbol.Stop) > -1 ? EventOption.Stop : 0;
        const once: number = options.indexOf(OptionSymbol.Once) > -1 ? EventOption.Once : 0;
        const noZone: number = options.indexOf(OptionSymbol.NoZone) > -1 ? EventOption.NoZone : 0;
        const capture: number = options.indexOf(OptionSymbol.Capture) > -1 ? EventOption.Capture : 0;

        const bitVal: number = this.getBitValue(capture, noZone, once, passive, stop, preventDefault, inBrowser);
        const eventOptionsObj: EventOptionsObject = this.getEventOptionsObject(bitVal);
        const inZone: boolean = NgZone.isInAngularZone();

        const intermediateListener: EventListener = (event: Event) => {
            if (stop) {
                event.stopPropagation();
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
                this.ngZone.run(() => listener(event));
            }
        };

        if (inZone) {
            this.ngZone.runOutsideAngular(() =>
                element.addEventListener(type, intermediateListener, eventOptionsObj)
            );
        } else {
            element.addEventListener(type, intermediateListener, eventOptionsObj);
        }

        return () => this.ngZone.runOutsideAngular(() =>
            element.removeEventListener(type, intermediateListener, eventOptionsObj)
        );
    }

    addGlobalEventListener(element: GlobalEventTarget, eventName: string, listener: EventListener): () => void {
        let target: EventTarget | undefined;

        if (element === GlobalEventTarget.Window) {
            target = typeof window !== 'undefined' ? window : undefined;
        } else if (element === GlobalEventTarget.Document) {
            target = this.doc;
        } else if (element === GlobalEventTarget.Body && this.doc) {
            target = this.doc.body;
        } else {
            const replace: string[] = [element, eventName];
            throw new Error(ErrorMsg.UnsupportedEventTarget.replace(/\|~/g, () => replace.shift() as string));
        }

        return this.addEventListener(target as HTMLElement, eventName, listener);
    }

    supports(eventName: string): boolean {
        let [type, options]: string[] = eventName.split('.');
        if (!options || !type) {
            return false;
        }

        type = type.trim();
        options = options.trim();

        if (options.length === 1 && this.keyEvents.indexOf(type as keyof DocumentEventMap) > -1) {
            return false;
        }

        for (const option in OptionSymbol) {
            if (OptionSymbol.hasOwnProperty(option)) {
                options = options.replace(OptionSymbol[option], '');
                if (options.length === 0) {
                    return true;
                }
            }
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

    private getBitValue(...options: number[]): number {
        const len: number = options.length;
        let val: number = 0;

        for (let i = 0; i < len; i++) {
            val = val | options[i];
        }

        return val;
    }

    private getEventOptionsObject(options: number): EventOptionsObject {
        if (!this.nativeEventObjectSupported) {
            return (options & EventOption.Capture) === EventOption.Capture;
        }

        const eventOptions: number = (options & EventOption.Capture) + (options & EventOption.Passive) + (options & EventOption.Once);

        if (eventOptions in this.nativeOptionsObjects) {
            return this.nativeOptionsObjects[eventOptions];
        }

        const optionsObj: { [key: string]: EventOptionsObject } = {
            capture: (eventOptions & EventOption.Capture) === EventOption.Capture,
            passive: (eventOptions & EventOption.Passive) === EventOption.Passive,
            once: (eventOptions & EventOption.Once) === EventOption.Once
        };
        this.nativeOptionsObjects[eventOptions] = optionsObj;

        return optionsObj;
    }

    private isOptionSupported(option: NativeEventOption): boolean {
        if (option in this.nativeOptionsSupported) {
            return this.nativeOptionsSupported[option];
        }

        this.nativeOptionsSupported[option] = false;

        if (!isPlatformBrowser(this.platformId)) {
            return this.nativeOptionsSupported[option];
        }

        try {
            window.addEventListener(option, () => {
            }, Object.defineProperty({}, option, {
                get: () => this.nativeOptionsSupported[option] = true
            }));
        } catch {
        }

        return this.nativeOptionsSupported[option];
    }
}
