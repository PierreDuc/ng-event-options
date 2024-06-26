import { NgZone } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { DomEventOptionsPlugin } from './dom-event-options-plugin.service';

import { ErrorMsg } from '../enum/error-msg.enum';
import { GlobalEventTarget } from '../enum/global-event-target.enum';
import { OptionSymbol } from '../enum/option-symbol.enum';
import { NativeEventOption } from '../enum/native-event-option.enum';
import { OperatorSymbol } from '../enum/operator-symbol.enum';

let domEventOptionsPlugin: DomEventOptionsPlugin;
let el: HTMLDivElement;
let ngZone: NgZone;

describe('Dom event options plugin', () => {
  const noop: EventListener = () => void 0;
  const addEvent = (
    options: string = '*',
    element: HTMLElement = el,
    callback: EventListener = noop,
    useZone: boolean = true,
  ) => {
    if (useZone) {
      return ngZone.run(() =>
        domEventOptionsPlugin.addEventListener(element, `click.${options}`, callback),
      );
    } else {
      return ngZone.runOutsideAngular(() =>
        domEventOptionsPlugin.addEventListener(element, `click.${options}`, callback),
      );
    }
  };
  const addGlobalEvent = (
    target: GlobalEventTarget,
    options: string = '*',
    callback: EventListener = noop,
  ): (() => void) =>
    domEventOptionsPlugin.addGlobalEventListener(target, `click.${options}`, callback);

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DomEventOptionsPlugin] });
    domEventOptionsPlugin = TestBed.get(DomEventOptionsPlugin);
    ngZone = TestBed.get(NgZone);
  });

  it('should have tested for browser supported', async () => {
    await expect(domEventOptionsPlugin).toBeDefined();
    await expect(domEventOptionsPlugin['nativeEventObjectSupported']).toBeDefined();
  });

  it('removeEventListener should be called on the element', async () => {
    el = document.createElement('div');
    spyOn(el, 'removeEventListener');
    addEvent()();
    expect(el.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('should reuse AddEventListenerObjects for native options regardless of the order of options', async () => {
    el = document.createElement('div');

    // @ts-expect-error testing readonly properties
    domEventOptionsPlugin['nativeOptionsObjects'] = {};

    addEvent(OptionSymbol.Passive + OptionSymbol.Capture);
    addEvent(OptionSymbol.Capture + OptionSymbol.Passive);
    addEvent(OptionSymbol.Capture + OptionSymbol.NoZone + OptionSymbol.Passive);
    addEvent(OptionSymbol.Passive + OptionSymbol.NoZone);

    expect(Object.keys(domEventOptionsPlugin['nativeOptionsObjects']).length).toEqual(2);
  });

  describe('AddEventListener', () => {
    it('should return a function', () => {
      el = document.createElement('div');
      expect(typeof addEvent()).toEqual('function');
    });

    it('should be called on the element', () => {
      el = document.createElement('div');
      spyOn(el, 'addEventListener');
      addEvent();
      expect(el.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should throw an error on passive, prevent default', () => {
      el = document.createElement('div');
      expect(() => addEvent(OptionSymbol.Passive + OptionSymbol.PreventDefault)).toThrowError(
        ErrorMsg.PassivePreventDefault,
      );
    });
  });

  describe('AddGlobalEventListener', () => {
    it('addGlobalEventListener should return a function', () => {
      Object.values(GlobalEventTarget).forEach((globalTarget) =>
        expect(typeof addGlobalEvent(globalTarget as GlobalEventTarget)).toEqual('function'),
      );
    });

    it('addGlobalEventListener throw on unknown element name', () => {
      const element = 'html' as GlobalEventTarget;
      const replace: string[] = [element, `click.${OptionSymbol.ForceSymbol}`];
      const error: string = ErrorMsg.UnsupportedEventTarget.replace(
        /\|~/g,
        () => replace.shift() as string,
      );

      expect(() => addGlobalEvent(element, OptionSymbol.ForceSymbol)).toThrowError(error);
    });
  });

  describe('Support', () => {
    it('should support only events with a dot and with proper settings', () => {
      expect(domEventOptionsPlugin.supports('test')).toEqual(false);
      expect(domEventOptionsPlugin.supports('click#pcon')).toEqual(false);
      expect(domEventOptionsPlugin.supports('test.')).toEqual(false);
      expect(domEventOptionsPlugin.supports('.')).toEqual(false);
      expect(domEventOptionsPlugin.supports('click.pcon')).toEqual(true);
      expect(domEventOptionsPlugin.supports('mousemove.pp')).toEqual(false);
      expect(domEventOptionsPlugin.supports('mousedown.p')).toEqual(true);
      expect(domEventOptionsPlugin.supports('submit.pconsdb')).toEqual(true);
      expect(domEventOptionsPlugin.supports('keydown.p')).toEqual(false);
      expect(domEventOptionsPlugin.supports('keydown.p*')).toEqual(true);
      expect(domEventOptionsPlugin.supports('foo.pc')).toEqual(true);
      expect(domEventOptionsPlugin.supports(' click. pc ')).toEqual(true);
    });
  });

  describe('Check `Once` option', () => {
    let listener: { listener: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listener = { listener: noop };
      spyOn(listener, 'listener');
    });

    const performClickEvent = (options: OptionSymbol = OptionSymbol.ForceSymbol): void => {
      addEvent(options, el, listener.listener);
      el.click();
      el.click();
    };

    it('should call the callback twice when triggered twice', () => {
      performClickEvent();
      expect(listener.listener).toHaveBeenCalledTimes(2);
    });

    it('should call the callback only once when the `Once` option is used', () => {
      performClickEvent(OptionSymbol.Once);
      expect(listener.listener).toHaveBeenCalledTimes(1);
    });

    it('should call the callback only once even when `Once` is not supported', () => {
      domEventOptionsPlugin['nativeOptionsSupported'][NativeEventOption.Once] = false;
      performClickEvent(OptionSymbol.Once);
      expect(listener.listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Check `NoZone` option', () => {
    it('should be outside the zone when the `NoZone` option is used', () => {
      el = document.createElement('div');
      let result = true;

      addEvent(OptionSymbol.NoZone, el, () => (result = NgZone.isInAngularZone()));
      el.click();

      expect(result).toEqual(false);
    });

    it('should not call runOutsideAngular when already outside NgZone', () => {
      spyOn(ngZone, 'runOutsideAngular');
      spyOn(ngZone, 'run');
      el = document.createElement('div');
      addEvent(OptionSymbol.NoZone, el, noop, false);
      el.click();

      expect(ngZone.runOutsideAngular).toHaveBeenCalledTimes(1);
      expect(ngZone.run).toHaveBeenCalledTimes(0);
    });

    it('should call runOutsideAngular and run when inside NgZone', () => {
      spyOn(ngZone, 'runOutsideAngular');
      spyOn(ngZone, 'run');
      el = document.createElement('div');
      addEvent();
      el.click();

      expect(ngZone.runOutsideAngular).toHaveBeenCalledTimes(0);
      expect(ngZone.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('Check `PreventDefault` option', () => {
    it('should prevent default behaviour when the `PreventDefault` option is used', () => {
      el = document.createElement('div');
      let result = false;

      addEvent(OptionSymbol.PreventDefault, el, (event) => (result = event.defaultPrevented));
      el.click();

      expect(result).toEqual(true);
    });
  });

  describe('Check `Stop` option', () => {
    let listeners: { [key: string]: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listeners = {
        listener1: () => {},
        listener2: () => {},
      };
      spyOn(listeners, 'listener1');
      spyOn(listeners, 'listener2');
    });

    it('should stop the immediate propagation of an event', () => {
      addEvent(OptionSymbol.Stop, el, listeners.listener1);
      addEvent(OptionSymbol.ForceSymbol, el, listeners.listener2);

      el.click();

      expect(listeners.listener1).toHaveBeenCalledTimes(1);
      expect(listeners.listener2).toHaveBeenCalledTimes(0);
    });

    it('should stop the propagation to a parent', () => {
      const parent: HTMLDivElement = document.createElement('div');
      parent.appendChild(el);

      addEvent(OptionSymbol.ForceSymbol, parent, listeners.listener2);
      addEvent(OptionSymbol.Stop, el, listeners.listener1);
      addEvent(OptionSymbol.ForceSymbol, parent, listeners.listener1);

      el.click();

      expect(listeners.listener1).toHaveBeenCalledTimes(1);
      expect(listeners.listener2).toHaveBeenCalledTimes(0);
    });

    it('should work without actually having a listener', () => {
      addEvent(OptionSymbol.Stop, el, null as unknown as EventListener);
      addEvent(OptionSymbol.ForceSymbol, el, listeners.listener2);

      el.click();

      expect(listeners.listener1).toHaveBeenCalledTimes(0);
      expect(listeners.listener2).toHaveBeenCalledTimes(0);
    });
  });

  describe('Check `Capture` option', () => {
    let parent: HTMLDivElement;
    let childVisited: boolean;
    let inCapture: boolean;

    beforeEach(() => {
      parent = document.createElement('div');
      el = document.createElement('div');
      parent.appendChild(el);

      childVisited = false;
      inCapture = false;
    });

    it('should create an event triggered in the capture phase', () => {
      let result = false;

      addEvent(OptionSymbol.Capture, parent, () => (inCapture = !childVisited));
      addEvent(OptionSymbol.ForceSymbol, parent, () => (result = childVisited && inCapture));
      addEvent(OptionSymbol.ForceSymbol, el, () => (childVisited = true));
      el.click();

      expect(result).toEqual(true);
    });

    it('should create an event triggered in the capture phase when there is no native event object support', () => {
      domEventOptionsPlugin['nativeEventObjectSupported'] = false;

      let result = false;

      addEvent(OptionSymbol.Capture, parent, () => (inCapture = !childVisited));
      addEvent(OptionSymbol.ForceSymbol, parent, () => (result = childVisited && inCapture));
      addEvent(OptionSymbol.ForceSymbol, el, () => (childVisited = true));
      el.click();

      expect(result).toEqual(true);
    });
  });

  describe('Check `Passive` option', () => {
    it('should not set defaultPrevented on true when calling preventDefault on the event', () => {
      el = document.createElement('div');

      let result = true;

      addEvent(OptionSymbol.Passive, el, (event) => {
        event.preventDefault();
        result = event.defaultPrevented;
      });

      el.click();

      expect(result).toEqual(false);
    });

    it('should not create a passive event when passive is not supported', () => {
      domEventOptionsPlugin['nativeEventObjectSupported'] = false;
      domEventOptionsPlugin['nativeOptionsSupported'][NativeEventOption.Passive] = false;

      el = document.createElement('div');

      let result = false;

      addEvent(OptionSymbol.Passive, el, (event) => {
        event.preventDefault();
        result = event.defaultPrevented;
      });
      el.click();

      expect(result).toEqual(true);
    });
  });

  describe('Check `InBrowser` option', () => {
    let listener: { listener: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listener = { listener: noop };
      spyOn(listener, 'listener');
    });

    it('should call the listener when inside a browser environment', () => {
      addEvent(OptionSymbol.InBrowser, el, listener.listener);
      el.click();
      expect(listener.listener).toHaveBeenCalledTimes(1);
    });

    it('should not call the listener when inside a non browser environment', () => {
      // @ts-expect-error testing private readonly properties
      domEventOptionsPlugin.platformId = 'non-browser';

      const callback1: () => void = addEvent(OptionSymbol.InBrowser, el, listener.listener);
      const callback2: () => void = addGlobalEvent(
        GlobalEventTarget.Window,
        OptionSymbol.InBrowser,
        listener.listener,
      );

      callback1();
      callback2();
      el.click();

      expect(typeof callback1).toEqual('function');
      expect(typeof callback2).toEqual('function');
      expect(listener.listener).toHaveBeenCalledTimes(0);
    });
  });

  describe('Check `Throttle` operator', () => {
    let listener: { listener: EventListener };

    const time: number = 50;
    let callCount: number = 0;

    beforeEach(() => {
      el = document.createElement('div');
      callCount = 0;
      listener = {
        listener: () => {
          callCount = callCount + 1;
        },
      };
    });

    const checkThrottle = (immediate: 0 | 1 = 0) => {
      for (let i = 0; i < time; i++) {
        el.click();

        if (i === 0) {
          expect(callCount).toEqual(immediate);
        }

        tick(time / 10);
      }

      tick(time);

      expect(callCount).toBeLessThanOrEqual(time / 10 + 1);
      expect(callCount).toBeGreaterThanOrEqual(time / 10 - 1);
    };

    it('should throttle the event', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Throttle}{${time},0}`,
        el,
        listener.listener,
      );

      checkThrottle(0);
    }));

    it('should throttle the event and call immediate', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Throttle}{${time},1}`,
        el,
        listener.listener,
      );

      checkThrottle(1);
    }));

    it('should throttle with no time and no immediate', fakeAsync(() => {
      addEvent(`${OptionSymbol.ForceSymbol}|${OperatorSymbol.Throttle}{}`, el, listener.listener);

      checkThrottle(0);
    }));

    it('should throttle with just time', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Throttle}{${time}}`,
        el,
        listener.listener,
      );

      checkThrottle(0);
    }));

    it('should throttle with unknown operator', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Throttle}{${time}}foo[]`,
        el,
        listener.listener,
      );

      checkThrottle(0);
    }));
  });

  describe('Check `Debounce` operator', () => {
    let listener: { listener: EventListener };

    const time: number = 50;

    beforeEach(() => {
      el = document.createElement('div');
      listener = { listener: noop };
      spyOn(listener, 'listener');
    });

    const checkDebounce = (immediate: 0 | 1 = 0) => {
      for (let i = 0; i < time; i++) {
        el.click();

        if (i === 0) {
          expect(listener.listener).toHaveBeenCalledTimes(immediate);
        }

        tick(time / 10);
      }

      tick(time);

      expect(listener.listener).toHaveBeenCalledTimes(1);
    };

    it('should debounce the event', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Debounce}{${time},0}`,
        el,
        listener.listener,
      );

      checkDebounce(0);
    }));

    it('should debounce the event and call immediate', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Debounce}{${time},1}`,
        el,
        listener.listener,
      );

      checkDebounce(1);
    }));

    it('should debounce with no time and no immediate', fakeAsync(() => {
      addEvent(`${OptionSymbol.ForceSymbol}|${OperatorSymbol.Debounce}{}`, el, listener.listener);

      checkDebounce(0);
    }));

    it('should debounce with just time', fakeAsync(() => {
      addEvent(
        `${OptionSymbol.ForceSymbol}|${OperatorSymbol.Debounce}{${time}}`,
        el,
        listener.listener,
      );

      checkDebounce(0);
    }));

    it('should throw an error with unknown operator', () => {
      const wrongOperator = `${OperatorSymbol.Debounce}d`;

      expect(() =>
        addEvent(`${OptionSymbol.ForceSymbol}|${wrongOperator}{${time}}`, el, listener.listener),
      ).toThrowError(ErrorMsg.UnsupportedOperator.replace(/\|~/g, wrongOperator));
    });
  });
});
