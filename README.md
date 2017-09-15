[![npm](https://img.shields.io/npm/v/ng-event-options.svg)](https://www.npmjs.com/package/ng-event-options)

# ng.EventOptions

This angular module will enable you to add event listener options inside the angular template. Like, capture, 
passive and once, but also add an event listener outside the `NgZone` for additional performance of 
your application and/or when fired stop the event from bubbling. 

The module is only `1KB` gzipped, so no worries about that

## Usage

Add an event like you are used to, but add a `.` after the name. To add the options to this event you 
add any of the following characters (order is not important). All options default to `false`:

* p (creates a passive event)
* c (captures the event in the capture phase)
* o (after firing the event once, the listener will be removed)
* n (add the event listener outside the `NgZone`)
* s (stop the event from bubbling any further)
* d (preventing default browser behaviour)

### Basic example: 

Add the `NgEventOptionsModule` to your `AppModule`:

    @NgModule({
        declarations: [
            AppComponent
        ],
        imports: [
            BrowserModule,
            NgEventOptionsModule
        ],
        providers: [],
        bootstrap: [
            AppComponent
        ]
    })
    export class AppModule {
    }

And you'll be able to do something like this:

    <button (click.pcon)="onClick($event)">Click</button>
    
This will create a click event on the button which is passive (p), will be fired on the capture (c) phase, will only be 
fired once (o), and is running outside the `ngZone` (n)
    
## Supported events

All events should be supported

## Limitations

* Keymap event is not (yet) supported `(keydown.enter.pcon)`
