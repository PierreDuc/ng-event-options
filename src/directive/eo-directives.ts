import {Type} from "@angular/core";
import {EoBaseDirective} from "./eo-base.directive";

//{{BEGIN:Imports}
import {EoBlurDirective} from './events/eo-blur.directive';
import {EoChangeDirective} from './events/eo-change.directive';
import {EoClickDirective} from './events/eo-click.directive';
import {EoFocusDirective} from './events/eo-focus.directive';
import {EoInputDirective} from './events/eo-input.directive';
import {EoKeydownDirective} from './events/eo-keydown.directive';
import {EoKeypressDirective} from './events/eo-keypress.directive';
import {EoKeyupDirective} from './events/eo-keyup.directive';
import {EoMousedownDirective} from './events/eo-mousedown.directive';
import {EoMousemoveDirective} from './events/eo-mousemove.directive';
import {EoMouseoutDirective} from './events/eo-mouseout.directive';
import {EoMouseoverDirective} from './events/eo-mouseover.directive';
import {EoMouseupDirective} from './events/eo-mouseup.directive';
import {EoScrollDirective} from './events/eo-scroll.directive';
import {EoTouchendDirective} from './events/eo-touchend.directive';
import {EoTouchmoveDirective} from './events/eo-touchmove.directive';
import {EoTouchstartDirective} from './events/eo-touchstart.directive';
//{{END:Imports}}

export const EoDirectives: Type<EoBaseDirective<keyof DocumentEventMap>>[] = [
    //{{BEGIN:ClassNames}
EoBlurDirective,
EoChangeDirective,
EoClickDirective,
EoFocusDirective,
EoInputDirective,
EoKeydownDirective,
EoKeypressDirective,
EoKeyupDirective,
EoMousedownDirective,
EoMousemoveDirective,
EoMouseoutDirective,
EoMouseoverDirective,
EoMouseupDirective,
EoScrollDirective,
EoTouchendDirective,
EoTouchmoveDirective,
EoTouchstartDirective
//{{END:ClassNames}}
];
