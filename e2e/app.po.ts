import {browser, by, element} from 'protractor';

export class AppPage {

    getTestElement(id: string) {
        return element(by.css(`#${id}`));
    }

    navigateTo() {
        return browser.get('/');
    }
}
