import {NgZone} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {DomEventOptionsPlugin} from './dom-event-options-plugin.service';

import {ErrorMsg} from '../enum/error-msg.enum';
import {GlobalEventTarget} from '../enum/global-event-target.enum';
import {OptionSymbol} from '../enum/option-symbol.enum';
import {NativeEventOption} from '../enum/native-event-option.enum';

let domEventOptionsPlugin: DomEventOptionsPlugin;
let el: HTMLDivElement;
let ngZone: NgZone;

describe('Dom event options plugin', () => {
  const noop: EventListener = () => void 0;
  const addEvent = (options: string = '*', element: HTMLElement = el, callback: EventListener = noop, useZone: boolean = true) => {
    if (useZone) {
      return ngZone.run(() => domEventOptionsPlugin.addEventListener(element, `click.${options}`, callback));
    } else {
      return ngZone.runOutsideAngular(() => domEventOptionsPlugin.addEventListener(element, `click.${options}`, callback));
    }
  };
  const addGlobalEvent = (target: GlobalEventTarget, options: string = '*', callback: EventListener = noop): () => void =>
    domEventOptionsPlugin.addGlobalEventListener(target, `click.${options}`, callback);

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [DomEventOptionsPlugin]});
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
    await expect(el.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it('should reuse AddEventListenerObjects for native options regardless of the order of options', async () => {
    el = document.createElement('div');

    (domEventOptionsPlugin as any)['nativeOptionsObjects'] = {};

    addEvent(OptionSymbol.Passive + OptionSymbol.Capture);
    addEvent(OptionSymbol.Capture + OptionSymbol.Passive);
    addEvent(OptionSymbol.Capture + OptionSymbol.NoZone + OptionSymbol.Passive);
    addEvent(OptionSymbol.Passive + OptionSymbol.NoZone);

    await expect(Object.keys(domEventOptionsPlugin['nativeOptionsObjects']).length).toEqual(2);
  });

  describe('AddEventListener', () => {
    it('should return a function', async () => {
      el = document.createElement('div');
      expect(typeof addEvent()).toEqual('function');
    });

    it('should be called on the element', async () => {
      el = document.createElement('div');
      spyOn(el, 'addEventListener');
      addEvent();
      await expect(el.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('should throw an error on passive, prevent default', async () => {
      el = document.createElement('div');
      await expect(() => addEvent(OptionSymbol.Passive + OptionSymbol.PreventDefault))
        .toThrowError(ErrorMsg.PassivePreventDefault);
    });
  });

  describe('AddGlobalEventListener', () => {
    it('addGlobalEventListener should return a function', async () => {
      Object.values(GlobalEventTarget).forEach(globalTarget =>
        expect(typeof addGlobalEvent(globalTarget as GlobalEventTarget)).toEqual('function')
      );
    });

    it('addGlobalEventListener throw on unknown element name', async () => {
      const element: string = 'html';
      const replace: string[] = [element, `click.${OptionSymbol.ForceSymbol}`];
      const error: string = ErrorMsg.UnsupportedEventTarget.replace(/\|~/g, () => replace.shift() as string);

      await expect(() => addGlobalEvent(element as any, OptionSymbol.ForceSymbol)).toThrowError(error);
    });
  });

  describe('Support', () => {
    it('should support only events with a dot and with proper settings', async () => {
      await Promise.all([
        expect(domEventOptionsPlugin.supports('test')).toEqual(false),
        expect(domEventOptionsPlugin.supports('click#pcon')).toEqual(false),
        expect(domEventOptionsPlugin.supports('test.')).toEqual(false),
        expect(domEventOptionsPlugin.supports('.')).toEqual(false),
        expect(domEventOptionsPlugin.supports('click.pcon')).toEqual(true),
        expect(domEventOptionsPlugin.supports('mousemove.pp')).toEqual(false),
        expect(domEventOptionsPlugin.supports('mousedown.p')).toEqual(true),
        expect(domEventOptionsPlugin.supports('submit.pconsdb')).toEqual(true),
        expect(domEventOptionsPlugin.supports('keydown.p')).toEqual(false),
        expect(domEventOptionsPlugin.supports('keydown.p*')).toEqual(true),
        expect(domEventOptionsPlugin.supports('foo.pc')).toEqual(true),
        expect(domEventOptionsPlugin.supports(' click. pc ')).toEqual(true)
      ]);
    });

  });

  describe('Check `Once` option', () => {
    let listener: { listener: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listener = {listener: noop};
      spyOn(listener, 'listener');
    });

    const performClickEvent = (options: OptionSymbol = OptionSymbol.ForceSymbol): void => {
      addEvent(options, el, listener.listener);
      el.click();
      el.click();
    };

    it('should call the callback twice when triggered twice', async () => {
      performClickEvent();
      await expect(listener.listener).toHaveBeenCalledTimes(2);
    });

    it('should call the callback only once when the `Once` option is used', async () => {
      performClickEvent(OptionSymbol.Once);
      await expect(listener.listener).toHaveBeenCalledTimes(1);
    });

    it('should call the callback only once even when `Once` is not supported', async () => {
      const onceSupported: boolean = domEventOptionsPlugin['nativeOptionsSupported'][NativeEventOption.Once];
      domEventOptionsPlugin['nativeOptionsSupported'][NativeEventOption.Once] = false;
      performClickEvent(OptionSymbol.Once);
      await expect(listener.listener).toHaveBeenCalledTimes(1);
      domEventOptionsPlugin['nativeOptionsSupported'][NativeEventOption.Once] = onceSupported;
    });
  });

  describe('Check `NoZone` option', () => {
    it('should be outside the zone when the `NoZone` option is used', async () => {
      el = document.createElement('div');
      const result: boolean = await new Promise<boolean>((resolve) => {
        addEvent(OptionSymbol.NoZone, el, () => resolve(NgZone.isInAngularZone()));
        el.click();
      });

      await expect(result).toEqual(false);
    });

    it('should not call runOutsideAngular when already outside NgZone', async () => {
      spyOn<NgZone>(ngZone, 'runOutsideAngular');
      spyOn<NgZone>(ngZone, 'run');
      el = document.createElement('div');
      addEvent(OptionSymbol.NoZone, el, noop, false);
      el.click();

      await expect(ngZone.runOutsideAngular).toHaveBeenCalledTimes(1);
      await expect(ngZone.run).toHaveBeenCalledTimes(0);
    });

    it('should call runOutsideAngular and run when inside NgZone', async () => {
      spyOn<NgZone>(ngZone, 'runOutsideAngular');
      spyOn<NgZone>(ngZone, 'run');
      el = document.createElement('div');
      addEvent();
      el.click();

      await expect(ngZone.runOutsideAngular).toHaveBeenCalledTimes(0);
      await expect(ngZone.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('Check `PreventDefault` option', () => {
    it('should prevent default behaviour when the `PreventDefault` option is used', async () => {
      el = document.createElement('div');

      const result: boolean = await new Promise<boolean>(resolve => {
        addEvent(OptionSymbol.PreventDefault, el, event => resolve(event.defaultPrevented));
        el.click();
      });

      await expect(result).toEqual(true);
    });
  });

  describe('Check `Stop` option', () => {
    let listeners: { [key: string]: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listeners = {
        listener1: () => {
        },
        listener2: () => {
        }
      };
      spyOn(listeners, 'listener1');
      spyOn(listeners, 'listener2');
    });

    it('should stop the immediate propagation of an event', async () => {
      addEvent(OptionSymbol.Stop, el, listeners.listener1);
      addEvent(OptionSymbol.ForceSymbol, el, listeners.listener2);

      el.click();

      await expect(listeners.listener1).toHaveBeenCalledTimes(1);
      await expect(listeners.listener2).toHaveBeenCalledTimes(0);
    });

    it('should stop the propagation to a parent', async () => {
      const parent: HTMLDivElement = document.createElement('div');
      parent.appendChild(el);

      addEvent(OptionSymbol.ForceSymbol, parent, listeners.listener2);
      addEvent(OptionSymbol.Stop, el, listeners.listener1);
      addEvent(OptionSymbol.ForceSymbol, parent, listeners.listener1);

      el.click();

      await expect(listeners.listener1).toHaveBeenCalledTimes(1);
      await expect(listeners.listener2).toHaveBeenCalledTimes(0);
    });

    it('should work without actually having a listener', async () => {
      addEvent(OptionSymbol.Stop, el, null as any);
      addEvent(OptionSymbol.ForceSymbol, el, listeners.listener2);

      el.click();

      await expect(listeners.listener1).toHaveBeenCalledTimes(0);
      await expect(listeners.listener2).toHaveBeenCalledTimes(0);
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

    it('should create an event triggered in the capture phase', async () => {
      const result: boolean = await new Promise<boolean>(resolve => {
        addEvent(OptionSymbol.Capture, parent, () => inCapture = !childVisited);
        addEvent(OptionSymbol.ForceSymbol, parent, () => resolve(childVisited && inCapture));
        addEvent(OptionSymbol.ForceSymbol, el, () => childVisited = true);
        el.click();
      });

      await expect(result).toEqual(true);
    });

    it('should create an event triggered in the capture phase when there is no native event object support', async () => {
      const nativeSupported: boolean = domEventOptionsPlugin['nativeEventObjectSupported'] as boolean;
      domEventOptionsPlugin['nativeEventObjectSupported'] = false;

      const result: boolean = await new Promise<boolean>(resolve => {
        addEvent(OptionSymbol.Capture, parent, () => inCapture = !childVisited);
        addEvent(OptionSymbol.ForceSymbol, parent, () => resolve(childVisited && inCapture));
        addEvent(OptionSymbol.ForceSymbol, el, () => childVisited = true);
        el.click();
      });

      await expect(result).toEqual(true);
      domEventOptionsPlugin['nativeEventObjectSupported'] = nativeSupported;
    });
  });

  describe('Check `Passive` option', () => {
    it('should not set defaultPrevented on true when calling preventDefault on the event', async () => {
      el = document.createElement('div');

      const result: boolean = await new Promise<boolean>(resolve => {
        addEvent(OptionSymbol.Passive, el, event => {
          event.preventDefault();
          resolve(event.defaultPrevented);
        });
        el.click();
      });

      await expect(result).toEqual(false);
    });
  });

  describe('Check `InBrowser` option', () => {
    let listener: { listener: EventListener };

    beforeEach(() => {
      el = document.createElement('div');
      listener = {listener: noop};
      spyOn(listener, 'listener');
    });

    it('should call the listener when inside a browser environment', async () => {
      addEvent(OptionSymbol.InBrowser, el, listener.listener);
      el.click();
      await expect(listener.listener).toHaveBeenCalledTimes(1);
    });

    it('should not call the listener when inside a non browser environment', async () => {
      const platformId: Object = domEventOptionsPlugin['platformId'];
      (domEventOptionsPlugin as any).platformId = 'non-browser';

      const callback1: () => void = addEvent(OptionSymbol.InBrowser, el, listener.listener);
      const callback2: () => void = addGlobalEvent(GlobalEventTarget.Window, OptionSymbol.InBrowser, listener.listener);
      el.click();

      await expect(typeof callback1).toEqual('function');
      await expect(typeof callback2).toEqual('function');
      await expect(listener.listener).toHaveBeenCalledTimes(0);

      callback1();
      callback2();

      (domEventOptionsPlugin as any).platformId = platformId;
    });
  });
});
