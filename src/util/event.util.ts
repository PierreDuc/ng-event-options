import {NgZone} from "@angular/core";
import {EventOptionsObject} from "../type/event-options-object";
import {EventListenerOption} from "../enum/event-listener-option";
import {EventOptions} from "../interface/event-options";

const eventOptions: Map<number, AddEventListenerOptions> = new Map<number, AddEventListenerOptions>();
const optionSupported: Map<EventListenerOption, boolean> = new Map<EventListenerOption, boolean>();

export function addEventOptionListener(
    element: HTMLElement, eventName: keyof DocumentEventMap, eventListener: EventListener,
    options: EventOptions, ngZone?: NgZone
): EventListener {
    const listenerOptions: EventOptionsObject = getEventOptionsObject(options.passive, options.capture, options.once) as boolean;
    const intermediateListener: EventListener = (event: Event): void => {
        if (options.stop) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        if (options.once && !isOptionSupported(EventListenerOption.Once)) {
            element.removeEventListener(eventName, intermediateListener, listenerOptions);
        }
        eventListener(event);
    };

    if (ngZone && options.noZone) {
        ngZone.runOutsideAngular(() => {
            element.addEventListener(eventName, intermediateListener, listenerOptions);
        });
    } else if (ngZone) {
        ngZone.run(() => {
            element.addEventListener(eventName, intermediateListener, listenerOptions);
        });
    } else {
        element.addEventListener(eventName, intermediateListener, listenerOptions);
    }
    return intermediateListener;
}

export function getEventOptionsObject(passive: boolean, capture: boolean, once: boolean): EventOptionsObject {
    if (!isOptionSupported(EventListenerOption.Capture)) {
        optionSupported.set(EventListenerOption.Once, false);
        optionSupported.set(EventListenerOption.Passive, false);
        return capture;
    }
    const bitMask: number = getBitValue(passive, capture, once);
    if (eventOptions.has(bitMask)) {
        return eventOptions.get(bitMask);
    }

    const options: Partial<AddEventListenerOptions> = {capture: capture};
    if (isOptionSupported(EventListenerOption.Passive)) {
        options.passive = passive;
    }
    if (isOptionSupported(EventListenerOption.Once)) {
        options.once = once;
    }

    eventOptions.set(bitMask, options);
    return options;
}

export function isOptionSupported(option: EventListenerOption): boolean {
    if (optionSupported.has(option)) {
        return optionSupported.get(option);
    } else {
        let isSupported: boolean = false;
        try {
            window.addEventListener(option, null, Object.defineProperty(
                {}, option, {get: function(): void {isSupported = true}}
            ));
        } catch {}
        optionSupported.set(option, isSupported);
        return isSupported;
    }
}

function getBitValue(...args): number {
    return args.reduce((mask: number, bool: boolean, index: number) => mask | (bool ? Math.pow(2, index) : 0), 0);
}

