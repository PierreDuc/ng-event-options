import {Inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';

import {ErrorMsg} from '../enum/error-msg.enum';
import {EventOption} from '../enum/event-option.enum';
import {GlobalEventTarget} from '../enum/global-event-target.enum';
import {NativeEventOption} from '../enum/native-event-option.enum';
import {OptionSymbol} from '../enum/option-symbol.enum';

import {EventOptionsObject} from '../type/event-options-object';
import {getBitValue} from '../util/get-bit-value.util';

@Injectable()
// EventManagerPlugin is not yet part of the public API of Angular, once it is I can remove the `addGlobalEventListener`
export class DomEventOptionsPlugin /*extends EventManagerPlugin*/ {

  private nativeEventObjectSupported?: boolean;

  private readonly nativeOptionsObjects: { [key: number]: AddEventListenerOptions } = {};

  private readonly nativeOptionsSupported: { [O in NativeEventOption]: boolean } = {
    capture: false,
    once: false,
    passive: false
  };

  private readonly keyEvents: [keyof DocumentEventMap] = ['keydown', 'keypress', 'keyup'];

  private readonly separator: string = '.';

  private readonly optionSymbols: OptionSymbol[] = [];

  constructor(private readonly ngZone: NgZone,
              @Inject(DOCUMENT) private readonly doc: any,
              @Inject(PLATFORM_ID) private readonly platformId: Object) {
    this.setOptionSymbols();
    this.checkSupport();
  }

  addEventListener(element: HTMLElement, eventName: string, listener: EventListener): () => void {
    const [type, options]: string[] = eventName.split(this.separator);
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

    const bitVal: number = getBitValue(capture, once, passive);
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

      if (listener) {
        if (noZone || !inZone) {
          listener(event);
        } else {
          this.ngZone.run(() => listener(event));
        }
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
    if (!isPlatformBrowser(this.platformId)) {
      return () => {
      };
    }

    let target: EventTarget | undefined;

    if (element === GlobalEventTarget.Window) {
      target = window;
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
    const {type, options}: { type: string, options: string } = this.getTypeOptions(eventName);
    if (!type) {
      return false;
    }

    if (options.length === 1 && this.keyEvents.indexOf(type as keyof DocumentEventMap) > -1) {
      return false;
    }

    const chosenOptions: OptionSymbol[] = options.split('') as OptionSymbol[];

    return chosenOptions.every((option: OptionSymbol, index: number) =>
      this.optionSymbols.indexOf(option) !== -1 && index === chosenOptions.lastIndexOf(option)
    );
  }

  private checkSupport(): void {
    const supportObj: object = new Object(null);
    Object.keys(NativeEventOption).map(optionKey => NativeEventOption[optionKey as any]).forEach(nativeOption =>
      Object.defineProperty(supportObj, nativeOption, {
        get: () => {
          this.nativeOptionsSupported[nativeOption as NativeEventOption] = true;
        }
      })
    );

    try {
      window.addEventListener('test', new Function as EventListener, supportObj);
    } catch {
    }

    this.nativeEventObjectSupported = this.nativeOptionsSupported[NativeEventOption.Capture];
  }

  private getEventOptionsObject(options: number): EventOptionsObject {
    if (!this.nativeEventObjectSupported) {
      return (options & EventOption.Capture) === EventOption.Capture;
    }

    const eventOptions: number = (options & EventOption.Capture) + (options & EventOption.Passive) + (options & EventOption.Once);

    if (eventOptions in this.nativeOptionsObjects) {
      return this.nativeOptionsObjects[eventOptions];
    }

    const optionsObj: EventOptionsObject = {
      capture: (eventOptions & EventOption.Capture) === EventOption.Capture,
      passive: (eventOptions & EventOption.Passive) === EventOption.Passive,
      once: (eventOptions & EventOption.Once) === EventOption.Once
    };

    this.nativeOptionsObjects[eventOptions] = optionsObj;

    return optionsObj;
  }

  private getTypeOptions(eventName: string): { type: string, options: string } {
    let [type, options]: string[] = eventName.split(this.separator);

    if (!options || !type) {
      return {type: '', options: ''};
    }

    type = type.trim();
    options = options.trim();

    return {type, options};
  }

  private setOptionSymbols(): void {
    this.optionSymbols.length = 0;
    Object.keys(OptionSymbol).forEach(
      optionKey => this.optionSymbols.push(OptionSymbol[optionKey as any] as OptionSymbol)
    );
  }
}
