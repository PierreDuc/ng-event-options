import {Component, NgZone} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  // expect "true"
  public passiveTest: string = 'passiveTest';

  // expect 1
  public onceTest: number = 0;

  // expect "true"
  public preventDefaultTest: string = 'preventDefaultTest';

  // expect "true"
  public ngZoneTest: string = 'ngZoneTest';

  // expect "true"
  public captureTest: string = 'captureTest';

  // expect "true"
  public stopEmptyTest: string = 'stopEmptyTest';

  // expect 1
  public stopTest: number = -1;

  // expect "true"
  public throttleWaitTest: string = 'throttleWaitTest';

  // expect "true"
  public debounceWaitTest: string = 'debounceWaitTest';

  // expect "true"
  public throttleImmediateTest: string = 'throttleImmediateTest';

  // expect "true"
  public debounceImmediateTest: string = 'debounceImmediateTest';

  private capturePhase: boolean;

  constructor(private readonly ngZone: NgZone) {
  }

  onPassiveClick(event: MouseEvent): void {
    try {
      event.preventDefault();
    } catch {
    }
    this.passiveTest = (!event.defaultPrevented).toString();
  }

  onOnceClick(event: MouseEvent): void {
    this.onceTest++;
  }

  onPreventDefaultClick(event: MouseEvent): void {
    this.preventDefaultTest = event.defaultPrevented.toString();
  }

  onNgZoneClick(event: MouseEvent): void {
    const result: string = (!NgZone.isInAngularZone()).toString();
    this.ngZone.run(() => this.ngZoneTest = result);
  }

  onCaptureParentClick(event: MouseEvent): void {
    this.capturePhase = true;
  }

  onBubbleParentClick(event: MouseEvent): void {
    this.captureTest = this.capturePhase.toString();
  }

  onCaptureChildClick(event: MouseEvent): void {
    this.capturePhase = this.capturePhase === true;
  }

  onStopCaptureParentClick(event: MouseEvent): void {
    this.stopTest = 0;
  }

  onStopChildClick(event: MouseEvent): void {
    if (this.stopTest === 0) {
      this.stopTest = 1;
    }
  }

  onStopTestChildClick(event: MouseEvent): void {
    this.stopTest = 2;
  }

  onStopBubbleParentClick(event: MouseEvent): void {
    this.stopTest = 3;
  }

  onStopEmptyClick(event: MouseEvent): void {
    this.stopEmptyTest = 'sibling';
  }

  onStopParentEmptyClick(event: MouseEvent): void {
    this.stopEmptyTest = 'parent';
  }

  onThrottleWaitClick(event: MouseEvent): void {
    // console.log(event);
  }

  onDebounceWaitClick(event: MouseEvent): void {
    // console.log(event);
  }

  onThrottleImmediateClick(event: MouseEvent): void {
    // console.log(event);
  }

  onDebounceImmediateClick(event: MouseEvent): void {
    // console.log(event);
  }
}
