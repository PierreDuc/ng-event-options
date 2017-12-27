import {NgZone} from '@angular/core';
import {inject, TestBed} from '@angular/core/testing';

import {DomEventOptionsPlugin} from './dom-event-options-plugin.service';

import {ErrorMsg} from '../enum/error-msg.enum';
import {GlobalEventTarget} from '../enum/global-event-target.enum';
import {OptionSymbol} from '../enum/option-symbol.enum';

let domEventOptionsPlugin: DomEventOptionsPlugin;
let el: HTMLDivElement;

describe('Dom event options plugin', () => {
    const noop: EventListener = () => void 0;
    const addEvent = (options: string = '*', element: HTMLElement = el, callback: EventListener = noop): Function =>
        domEventOptionsPlugin.addEventListener(element, `click.${options}`, callback);
    const addGlobalEvent = (target: GlobalEventTarget, options: string = '*', callback: EventListener = noop) =>
        domEventOptionsPlugin.addGlobalEventListener(target, `click.${options}`, callback);

    beforeEach(() => {
        TestBed.configureTestingModule({providers: [DomEventOptionsPlugin]});
        domEventOptionsPlugin = TestBed.get(DomEventOptionsPlugin);
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

    it('should reuse AddEventListenerObjects for native options regardless of the order of options',
        inject([DomEventOptionsPlugin], async (domEventOptions: DomEventOptionsPlugin) => {
            const element: HTMLDivElement = document.createElement('div');
            domEventOptions.addEventListener(element, `click.${OptionSymbol.Passive}${OptionSymbol.Capture}`, noop);
            domEventOptions.addEventListener(element, `click.${OptionSymbol.Capture}${OptionSymbol.Passive}`, noop);
            domEventOptions.addEventListener(element, `click.${OptionSymbol.Capture}${OptionSymbol.NoZone}${OptionSymbol.Passive}`, noop);
            domEventOptions.addEventListener(element, `click.${OptionSymbol.Passive}${OptionSymbol.NoZone}`, noop);

            await expect(Object.keys(domEventOptions['nativeOptionsObjects']).length).toEqual(2);
        })
    );

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
            expect(typeof addGlobalEvent(GlobalEventTarget.Window)).toEqual('function');
        });

        it('addGlobalEventListener throw on unknown element name', async () => {
            const element: string = 'html';
            const replace: string[] = [element, `click.${OptionSymbol.ForceSymbol}`];
            const error: string = ErrorMsg.UnsupportedEventTarget.replace(/\|~/g, () => replace.shift() as string);

            await expect(() => addGlobalEvent(element as any, OptionSymbol.ForceSymbol)).toThrowError(error);
        });
    });

    describe('Support', () => {
        it('should support only events with a dot and with proper settings and valid dom event', async () => {
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
                expect(domEventOptionsPlugin.supports('keydown.p*')).toEqual(true)
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

        it('should not call runOutsideAngular when already outside NgZone',
            inject([NgZone], async (ngZone: NgZone) => {
                spyOn<NgZone>(ngZone, 'runOutsideAngular');
                el = document.createElement('div');
                ngZone.runOutsideAngular(() => addEvent(OptionSymbol.NoZone));
                el.click();

                await expect(ngZone.runOutsideAngular).toHaveBeenCalledTimes(1);
            })
        );
    });

    describe('Check `PreventDefault` option', () => {
        it('default behaviour should be prevented when the `PreventDefault` option is used', async () => {
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
        it('should create an event triggered in the capture phase of the event', async () => {
            const parent: HTMLDivElement = document.createElement('div');
            let childVisited: boolean = false;
            let inCapture: boolean = false;

            el = document.createElement('div');
            parent.appendChild(el);

            const result: boolean = await new Promise<boolean>(resolve => {
                addEvent(OptionSymbol.Capture, parent, () => inCapture = !childVisited);
                addEvent(OptionSymbol.ForceSymbol, parent, () => resolve(childVisited && inCapture));
                addEvent(OptionSymbol.ForceSymbol, el, () => childVisited = true);
                el.click();
            });

            await expect(result).toEqual(true);
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

            addEvent(OptionSymbol.InBrowser, el, listener.listener);
            el.click();
            await expect(listener.listener).toHaveBeenCalledTimes(0);

            (domEventOptionsPlugin as any).platformId = platformId;
        });
    });
});
