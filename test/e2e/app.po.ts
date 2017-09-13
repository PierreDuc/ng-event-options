import {browser, by, element} from 'protractor';

export class AppPage {

    getButtonText() {
        return element(by.css('app-root button')).getText();
    }

    navigateTo() {
        return browser.get('/');
    }

}
