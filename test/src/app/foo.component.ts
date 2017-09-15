import {Component, HostListener} from "@angular/core";

@Component({
    selector: 'app-foo',
    template: `<button>Foo Button</button>`
})
export class FooComponent {

    @HostListener('click.pn')
    public onClick(): void {
        console.log('click: pn');
    }

    @HostListener('document:click.p')
    public onDocClick(): void {
        console.log('doc click: p');
    }

    @HostListener('document:click')
    public onDocNormalClick(): void {
        console.log('doc normal click');
    }

    @HostListener('click')
    public onNormalClick(): void {
        console.log('normal click');
    }


}