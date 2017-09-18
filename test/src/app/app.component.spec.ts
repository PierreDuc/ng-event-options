import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {FooComponent} from "./foo.component";
import "jasmine";

describe('AppComponent', () => {
    beforeEach(async(() => {
        return TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FooComponent
            ]
        }).compileComponents();
    }));
    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));
    it('should render button with text Click', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('button').textContent).toContain('Click');
    }));
});
