import {Component, HostListener} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    @HostListener('body:keydown.enter')
    onKeyDown(): void {
        console.log('key down');
    }

    public showFoo: boolean = false;

    public onClick(event: MouseEvent): void {
        this.showFoo = !this.showFoo;
    }

}
