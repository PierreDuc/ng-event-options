import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgEventOptionsModule} from "ng-event-options";

import {AppComponent} from './app.component';

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
