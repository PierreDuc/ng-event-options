import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EoDirectives} from "./directive/eo-directives";

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        EoDirectives
    ],
    exports: [
        EoDirectives
    ]
})
export class NgEventOptionsModule {

}
