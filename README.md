[![npm](https://img.shields.io/npm/v/ng-event-options.svg)](https://www.npmjs.com/package/ng-event-options)

# NgEventOptions

Extended event binding for Angular

## Features

* Native event binding support for `passive`, `capture` and `once` event options
* Additional event options for `stopImmediatePropagation`, `stopPropagation` and `preventDefault`
* Angular event options for binding outside `NgZone` and only bind when inside `platformBrowser`
* The module is only `1KB` gzipped, so no worries about that

Increase the speed of your application by using the `passive` and `NgZone` options. Decrease your code size by
utilising the pre-defined additional options. 

### Prerequisites

Depends on latest Angular

    "dependencies": {
      "@angular/common": ">=5.0.0",
      "@angular/core": ">=5.0.0"
    }

### Installing

For npm install NgEventOptions using:

    npm install ng-event-options
    
Inside your project add to the `AppModule.imports`:

    @NgModule({
        imports: [
            // ...,
            NgEventOptionsModule
        ],
        // ...
    })
    export class AppModule {}

## Usage

Add an event like you are used to, but add a `.` after the name. To add the options to this event you 
add any of the following characters (order is not important). All options default to `false`:

* p (creates a passive event)
* c (captures the event in the capture phase)
* o (after firing the event once, the listener will be removed)
* n (add the event listener outside the `NgZone`)
* s (stop the event from bubbling any further)
* d (preventing default browser behaviour)
* b (only add listener when current environment is a browser for usage in Angular Universal)
* \* (forces the usage of the ngEventOptions event manager)

## Example

    <button (click.pcon)="onClick($event)">Click</button>
    
This will create a click event on the button which is passive (p), will be fired on the capture (c) phase, will only be 
fired once (o), and is running outside the `ngZone` (n)    

To add a `keydown`, `keyup`, `keypress` event with just one option, you have to use the `*` `ForceSymbol`

(these are all valid)

    <input (keydown.p*)="onKeyDown($event)">
    <input (keyup.o*)="onKeyUp($event)">
    <input (keypress.*d)="onKeyPress($event)">
    <input (keydown.pc)="onKeyDown($event)">
    
This is to prevent collision with the native Angular keymapping event handling

## Limitations

* Keymap event is not (yet) supported `(keydown.enter.pcon)`

## Built With

* [ng-packagr](https://github.com/dherges/ng-packagr) - Transpile your libraries to Angular Package Format

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/PierreDuc/ng-event-options/tags). 

## Authors

* **Poul Kruijt** - *Initial work* - [PierreDuc](https://github.com/PierreDuc/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Angular
* ng-packagr
