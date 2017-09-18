import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgEventOptionsModule} from "../../dist";

import {AppComponent} from './app/app.component';
import {FooComponent} from "./app/foo.component";

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
