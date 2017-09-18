import {
    TestBed, inject
} from '@angular/core/testing';
import {DomEventOptionsPlugin} from "./dom-event-options-plugin.service";
import {CommonModule} from "@angular/common";

describe('Dom event options plugin', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule
            ],
            providers: [
                DomEventOptionsPlugin
            ]
        });
    });

    it('should have tested for browser supported',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            expect(domEventOptionsPlugin).toBeDefined();
            expect(domEventOptionsPlugin['nativeEventObjectSupported']).toBeDefined();
        })
    );

    it('addEventListener should return a function',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            let el: HTMLElement = document.createElement('div');
            expect(domEventOptionsPlugin).toBeDefined();
            expect(typeof domEventOptionsPlugin.addEventListener(el, 'click.pcon', ()=>{})).toEqual('function')
        })
    );

    it('addEventListener should thrown an error on passive, prevent default',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            let el: HTMLElement = document.createElement('div');
            expect(domEventOptionsPlugin).toBeDefined();
            expect(() => {domEventOptionsPlugin.addEventListener(el, 'click.pd', ()=>{})}).toThrowError(/EventOptions/)
        })
    );

    it('addGlobalEventListener should return a function',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            expect(domEventOptionsPlugin).toBeDefined();
            expect(typeof domEventOptionsPlugin.addGlobalEventListener('window', 'click.pcon', ()=>{})).toEqual('function')
        })
    );

    it('addGlobalEventListener throw on unknown element name',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            expect(domEventOptionsPlugin).toBeDefined();
            expect(() => {domEventOptionsPlugin.addGlobalEventListener('html' as any, 'click.pd', ()=>{})}).toThrowError(/Unsupported event target/)
        })
    );

    it('supports should support only events with a dot and with proper settings and valid dom event',
        inject([DomEventOptionsPlugin], (domEventOptionsPlugin: DomEventOptionsPlugin) => {
            expect(domEventOptionsPlugin).toBeDefined();
            expect(domEventOptionsPlugin.supports('test')).toEqual(false);
            expect(domEventOptionsPlugin.supports('test#pasd')).toEqual(false);
            expect(domEventOptionsPlugin.supports('test.')).toEqual(false);
            expect(domEventOptionsPlugin.supports('.')).toEqual(false);
            expect(domEventOptionsPlugin.supports('click.pcon')).toEqual(true);
            expect(domEventOptionsPlugin.supports('mousemove.pp')).toEqual(false);
            expect(domEventOptionsPlugin.supports('mousedown.p')).toEqual(true);
            expect(domEventOptionsPlugin.supports('submit.pconsd')).toEqual(true);
        })
    );
});