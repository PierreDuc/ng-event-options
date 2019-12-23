import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgEventOptionsModule } from '../../../ng-event-options/src/lib/ng-event-options.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, NgEventOptionsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
