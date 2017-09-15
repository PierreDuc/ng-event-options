import {Component, HostListener, NgZone} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [`
        :host {
            width: 400px;
            height: 400px;
            displaY:block;
            border: 1px solid #333
        }
    
    `
    ]
})
export class AppComponent {

    public showFoo: boolean = false;

    constructor(private ngZone: NgZone){}

    @HostListener('click.sc')
    public onClickApp(event: MouseEvent): void {
        console.log('on click app');
    }

    public onClick(event: MouseEvent): void {
        console.log('on click app');
        this.ngZone.run(() => {
            this.showFoo = !this.showFoo;
        })
    }

    public onClickFoo(event: MouseEvent): void {
        console.log('on click foo')
    }

}
