import { NgModule } from '@angular/core';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';
import { DomEventOptionsPlugin } from './service/dom-event-options-plugin.service';

@NgModule({
  providers: [
    {
      provide: EVENT_MANAGER_PLUGINS,
      useClass: DomEventOptionsPlugin,
      multi: true
    }
  ]
})
export class NgEventOptionsModule {}
