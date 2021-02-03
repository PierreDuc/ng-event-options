import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

import { ErrorMsg } from '../enum/error-msg.enum';
import { EventOption } from '../enum/event-option.enum';
import { GlobalEventTarget } from '../enum/global-event-target.enum';
import { NativeEventOption } from '../enum/native-event-option.enum';
import { OptionSymbol } from '../enum/option-symbol.enum';

import { EventOptionsObject } from '../type/event-options-object';
import { getBitValue } from '../helper/get-bit-value';
import { OperatorSymbol } from '../enum/operator-symbol.enum';
import { throttleEvent } from '../helper/throttle-event';
import { debounceEvent } from '../helper/debounce-event';

@Injectable()
// EventManagerPlugin is not yet part of the public API of Angular, once it is I can remove the `addGlobalEventListener`
export class DomEventOptionsPlugin /*extends EventManagerPlugin*/ {
  private nativeEventObjectSupported?: boolean;

  private readonly nativeOptionsObjects: {
    [key: number]: AddEventListenerOptions;
  } = {};

  private readonly nativeOptionsSupported: {
    [O in NativeEventOption]: boolean;
  } = {
    capture: false,
    once: false,
    passive: false
  };

  private readonly keyEvents: (keyof DocumentEventMap)[] = ['keydown', 'keypress', 'keyup'];

  private readonly blockSeparator: string = '|';

  private readonly operatorSeparator: string = ',';

  private readonly optionSeparator: string = '.';

  private readonly optionSymbols: OptionSymbol[] = [];

  private readonly operatorSymbols: OperatorSymbol[] = [];

  constructor(
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private readonly doc: any,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {
    this.setSymbols();
    this.checkSupport();
  }

  addEventListener(element: HTMLElement, eventName: string, listener: EventListener): () => void {
    const { type, options, operators } = this.getTypeOptions(eventName);
    const inBrowser: number =
      options.indexOf(OptionSymbol.InBrowser) > -1 ? EventOption.InBrowser : 0;

    if (inBrowser && !isPlatformBrowser(this.platformId)) {
      return (): void => void 0;
    }

    if (typeof listener !== 'function') {
      listener = () => void 0;
    }

    const passive: number = options.indexOf(OptionSymbol.Passive) > -1 ? EventOption.Passive : 0;
    const preventDefault: number =
      options.indexOf(OptionSymbol.PreventDefault) > -1 ? EventOption.PreventDefault : 0;

    if (passive && preventDefault) {
      throw new Error(ErrorMsg.PassivePreventDefault);
    }

    const stop: number = options.indexOf(OptionSymbol.Stop) > -1 ? EventOption.Stop : 0;
    const once: number = options.indexOf(OptionSymbol.Once) > -1 ? EventOption.Once : 0;
    const noZone: number = options.indexOf(OptionSymbol.NoZone) > -1 ? EventOption.NoZone : 0;
    const capture: number = options.indexOf(OptionSymbol.Capture) > -1 ? EventOption.Capture : 0;

    const operatorSettings: Partial<{ [OS in OperatorSymbol]: string[] }> = this.parseOperators(
      operators
    );

    const debounceParams: string[] | undefined = operatorSettings[OperatorSymbol.Debounce];
    const throttleParams: string[] | undefined = operatorSettings[OperatorSymbol.Throttle];

    const bitVal: number = getBitValue(capture, once, passive);
    const eventOptionsObj: EventOptionsObject = this.getEventOptionsObject(bitVal);
    const inZone: boolean = NgZone.isInAngularZone();

    const callback: EventListener = (event: Event) => {
      if (noZone || !inZone) {
        listener(event);
      } else {
        this.ngZone.run((): void => listener(event));
      }
    };

    let debounceCallback: EventListener;
    let throttleCallback: EventListener;

    if (debounceParams) {
      debounceCallback = debounceEvent(callback, ...debounceParams.map(p => parseInt(p, 10)));
    }

    if (throttleParams) {
      throttleCallback = throttleEvent(callback, ...throttleParams.map(p => parseInt(p, 10)));
    }

    const intermediateListener: EventListener = (event: Event): void => {
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

      if (debounceCallback) {
        debounceCallback(event);
      } else if (throttleCallback) {
        throttleCallback(event);
      } else {
        callback(event);
      }
    };

    if (inZone) {
      this.ngZone.runOutsideAngular((): void =>
        element.addEventListener(type, intermediateListener, eventOptionsObj)
      );
    } else {
      element.addEventListener(type, intermediateListener, eventOptionsObj);
    }

    return () =>
      this.ngZone.runOutsideAngular((): void =>
        element.removeEventListener(type, intermediateListener, eventOptionsObj)
      );
  }

  addGlobalEventListener(
    element: GlobalEventTarget,
    eventName: string,
    listener: EventListener
  ): () => void {
    if (!isPlatformBrowser(this.platformId)) {
      return (): void => void 0;
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
      throw new Error(
        ErrorMsg.UnsupportedEventTarget.replace(/\|~/g, () => replace.shift() as string)
      );
    }

    return this.addEventListener(target as HTMLElement, eventName, listener);
  }

  supports(eventName: string): boolean {
    const { type, options } = this.getTypeOptions(eventName);

    if (!type) {
      return false;
    }

    if (options.length === 1 && this.keyEvents.indexOf(type as keyof DocumentEventMap) > -1) {
      return false;
    }

    const chosenOptions: OptionSymbol[] = options.split('') as OptionSymbol[];

    return chosenOptions.every(
      (option: OptionSymbol, index: number): boolean =>
        this.optionSymbols.indexOf(option) !== -1 && index === chosenOptions.lastIndexOf(option)
    );
  }

  private checkSupport(): void {
    const supportObj: AddEventListenerOptions = new Object(null);

    Object.keys(NativeEventOption)
      .map((optionKey) => NativeEventOption[optionKey as keyof typeof NativeEventOption])
      .forEach(nativeOption =>
        Object.defineProperty(supportObj, nativeOption, {
          get: () => {
            this.nativeOptionsSupported[nativeOption as NativeEventOption] = true;
          }
        })
      );

    try {
      window.addEventListener('test', new Function() as EventListener, supportObj);
    } catch {}

    this.nativeEventObjectSupported = this.nativeOptionsSupported[NativeEventOption.Capture];
  }

  private parseOperators(operatorsStr: string): Partial<{ [OS in OperatorSymbol]: string[] }> {
    const operators: Partial<{ [OS in OperatorSymbol]: string[] }> = {};

    if (operatorsStr) {
      operatorsStr.split(/},?/).forEach(operatorStr => {
        const parts: string[] = operatorStr.split('{');

        if (parts.length === 2) {
          const operator: OperatorSymbol = parts[0] as OperatorSymbol;

          if (operator && this.operatorSymbols.indexOf(operator) > -1) {
            operators[operator] = parts[1].split(this.operatorSeparator).filter(p => p);
          } else {
            throw new Error(
              ErrorMsg.UnsupportedOperator.replace(/\|~/g, operator)
            );
          }
        }
      });
    }

    return operators;
  }

  private getEventOptionsObject(options: number): EventOptionsObject {
    if (!this.nativeEventObjectSupported) {
      return (options & EventOption.Capture) === EventOption.Capture;
    }

    const eventOptions: number =
      (options & EventOption.Capture) +
      (options & EventOption.Passive) +
      (options & EventOption.Once);

    if (eventOptions in this.nativeOptionsObjects) {
      return this.nativeOptionsObjects[eventOptions];
    }

    const optionsObj: EventOptionsObject = {
      capture: !!(eventOptions & EventOption.Capture),
      passive: !!(eventOptions & EventOption.Passive),
      once: !!(eventOptions & EventOption.Once)
    };

    this.nativeOptionsObjects[eventOptions] = optionsObj;

    return optionsObj;
  }

  private getTypeOptions(eventName: string): { type: string; options: string; operators: string } {
    let [type, options, operators]: string[] = eventName.split(this.optionSeparator);

    if (!options || !type) {
      return { type: '', options: '', operators: '' };
    }

    [options, operators] = options.split(this.blockSeparator);

    if (!operators) {
      operators = '';
    }

    type = type.trim();
    options = options.trim();
    operators = operators.trim();

    return { type, options, operators };
  }

  private setSymbols(): void {
    this.optionSymbols.length = 0;
    Object.keys(OptionSymbol).forEach(optionKey =>
      this.optionSymbols.push(OptionSymbol[optionKey as keyof typeof OptionSymbol])
    );

    this.operatorSymbols.length = 0;
    Object.keys(OperatorSymbol).forEach(operatorSymbol =>
      this.operatorSymbols.push(OperatorSymbol[operatorSymbol as keyof typeof OperatorSymbol])
    );
  }
}
