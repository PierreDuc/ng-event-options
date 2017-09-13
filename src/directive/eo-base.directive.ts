import {ElementRef, EventEmitter, NgZone, OnDestroy, OnInit} from "@angular/core";
import {EventOptions} from "../interface/event-options";
import {addEventOptionListener} from "../util/event.util";

export abstract class EoBaseDirective<K extends keyof DocumentEventMap> implements OnDestroy, OnInit {

    public abstract output: EventEmitter<DocumentEventMap[K]>;

    protected abstract eventName: K;

    private listener: EventListener;

    private onEvent: EventListener = (event: DocumentEventMap[K]): void => {
        this.output.emit(event);
    };

    constructor(protected readonly elementRef: ElementRef,
                protected readonly ngZone: NgZone) {
    }

    ngOnDestroy(): void {
        this.removeEvent();
    }

    ngOnInit(): void {
        this.addElementEvent();
    }

    private addElementEvent(): void {
        this.ngZone.runOutsideAngular(() => {
            this.listener = addEventOptionListener(this.elementRef.nativeElement, this.eventName, this.onEvent, this.getOptions(), this.ngZone);
        });
    }

    private getOptions(): EventOptions {
        const prefix: string = this.eventName + '.';
        const attrs: NamedNodeMap = this.elementRef.nativeElement.attributes;
        const attr: string = (Object.keys(attrs).map(
            key => attrs[key].name.toLowerCase()
        ).find(
            attr => !attr.indexOf(prefix)
        ) || '').replace(prefix, '');

        const passive: boolean = attr.indexOf('p') > -1;
        const stop: boolean = attr.indexOf('s') > -1;

        if (passive && stop) {
            throw new Error("EventOptions: You cannot stop a passive event. Do not use 'passive' and 'stop' simultaneously");
        }

        return {
            passive: passive,
            stop: stop,
            capture: attr.indexOf('c') > -1,
            once: attr.indexOf('o') > -1,
            noZone: attr.indexOf('n') > -1
        };
    }

    private removeEvent(): void {
        this.elementRef.nativeElement.removeEventListener(this.eventName, this.listener);
    }
}
