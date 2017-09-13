module.exports =
    `import {EoBaseDirective} from "../eo-base.directive";
import {Directive, ElementRef, EventEmitter, NgZone, Output} from "@angular/core";

@Directive({
    selector: '[{{eventName}}*]'
})
export class Eo{{EventName}}Directive extends EoBaseDirective<'{{eventName}}'> {

    @Output('{{eventName}}*')
    public output: EventEmitter<{{EventType}}> = new EventEmitter<{{EventType}}>();

    protected eventName: '{{eventName}}' = '{{eventName}}';

    constructor(elementRef: ElementRef, ngZone: NgZone) {
        super(elementRef, ngZone);
    }

}
`;
