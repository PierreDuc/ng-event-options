# ng.EventOptions

This angular module will enable you to add event listener options inside the angular template. Like, capture, 
passive and once, but also add an event listener outside the `NgZone` for additional performance of 
your application and/or when fired stop the event from bubbling. 

The module is only `2KB` gzipped

## Usage

Add an event like you are used to, but add a `*` after the name. To add the options to this event you 
add an attribute which starts with the name of the event followed by a dot and then any of the 
following characters (order is not important). All options default to `false`:

* p (creates an passive event)
* c (captures the event in the capture phase)
* o (after firing the event once, the listener will be removed)
* n (add the event listener outside the `NgZone`)
* s (stop the event from bubbling any further and preventing default)

Basic example: 

    <button (click*)="onClick($event)" click.pcon>Click</button>
    
This will create a click event on the button which is passive (p), will be fired on the capture (c) phase, will only be 
fired once (o), and is running outside the `ngZone` (n)
    
There is also the option to add an event listener to a `nativeElement` inside your class. This will check 
for compatibility of the current browser. If you add the optional `NgZone` reference, it will add the 
event outside the `NgZone`. It returns an intermediate `EventListener` which you can use to remove the listener from
the element on `ngOnDestroy` for instance:

    addEventOptionListener(
        element: HTMLElement, 
        eventName: keyof DocumentEventMap, 
        eventListener: EventListener,
        options: EventOptions, 
        ngZone?: NgZone
    ): EventListener;
    
Where `EventOptions` is : 

    interface EventOptions extends AddEventListenerOptions {
        noZone?: boolean;
        stop?: boolean;
    }
    
Example: 

    @Component({/*...*/})
    export class ExampleComponent implements OnInit, OnDestroy {
        
         private listener: EventListener;
        
         constructor(private elementRef: ElementRef, private ngZone: NgZone) {}
         
         ngOnInit(): void {
             this.listener = addEventOptionListener(this.elementRef.nativeElement, 'click', this.onClick, {
                passive: true,
                noZone: true,
             }, this.ngZone);
         }
         
         ngOnDestroy(): void {
            this.elementRef.nativeElement.removeEventListener('click', this.listener);
         }
         
         onClick: EventListener = (event: MouseEvent): void => {
            console.log("I have been clicked");
         };
    }
    
## Supported events

blur, change, click, focus, input, keydown, keypress, keyup, mousedown, mousemove, mouseout, mouseover, mouseup, 
scroll, touchend, touchmove, touchstart

## Extendability

If you are missing an event which you would like to have these features as well, you can extend 
the `EoBaseDirective`:
    
    @Directive({
        selector: '[submit*]'
    })
    export class EoSubmitEventDirective extends EoBaseDirective<'customDocEvent'> {
    
        @Output('submit*')
        public output: EventEmitter<Event> = new EventEmitter<Event>();
    
        protected eventName: 'submit' = 'submit';
    
        constructor(elementRef: ElementRef, ngZone: NgZone) {
            super(elementRef, ngZone);
        }
    
    }

## Limitations

* Keymap event is not (yet) supported `(keydown*.enter)`
* `@HostListener` is not supported. This is core angular, and cannot be hooked into. You can use the `ElementRef` of the
component, in combination with `addEventOptionListener`.

