import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgEventOptionsModule} from "ng-event-options";

import {AppComponent} from './app.component';
import {FooComponent} from "./foo.component";

@NgModule({
    declarations: [
        AppComponent,
        FooComponent
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
