[![npm](https://img.shields.io/npm/v/ng-event-options.svg)](https://www.npmjs.com/package/ng-event-options)
[![Build Status](https://travis-ci.org/PierreDuc/ng-event-options.svg?branch=master)](https://travis-ci.org/PierreDuc/ng-event-options)
[![codecov](https://codecov.io/gh/PierreDuc/ng-event-options/branch/master/graph/badge.svg)](https://codecov.io/gh/PierreDuc/ng-event-options)

# NgEventOptions

Extended event binding for Angular

## Features

* Native event binding support for `passive`, `capture` and `once` event options
* Additional event options for `stopImmediatePropagation`, `stopPropagation` and `preventDefault`
* Angular event options for binding outside `NgZone` and only bind when inside `platformBrowser`
* The module is only `1KB` gzipped, so no worries about that

Increase the speed of your application by using the `passive` and `NgZone` options. Decrease your code size by
utilising the pre-defined additional options. 

## Wiki

Look [here](https://github.com/PierreDuc/ng-event-options/wiki/Wiki) for the wiki

### Prerequisites

Look [here](https://github.com/PierreDuc/ng-event-options/wiki/Wiki#prerequisites) for this module's prerequisites

### Installing

Look [here](https://github.com/PierreDuc/ng-event-options/wiki/Wiki#installation) for installation instructions

## Usage

Look [here](https://github.com/PierreDuc/ng-event-options/wiki/Wiki#usage) for usage


## Examples

Look [here](https://github.com/PierreDuc/ng-event-options/wiki/Wiki#examples) for examples

## Limitations

* Keymap event is not (yet) supported `(keydown.enter.pcon)`

## Built With

* [ng-packagr](https://github.com/dherges/ng-packagr) - Transpile your libraries to Angular Package Format by [dherges](https://github.com/dherges)

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/PierreDuc/ng-event-options/tags). 

## Author

* **Poul Kruijt** - *Initial work* - [PierreDuc](https://github.com/PierreDuc/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [angular](https://github.com/angular/angular)
* [angular-cli](https://github.com/angular/angular-cli)
* [ng-packagr](https://github.com/dherges/ng-packagr)
