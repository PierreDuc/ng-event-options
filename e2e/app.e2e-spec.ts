import {AppPage} from './app.po';

describe('ng-event-options App', () => {

    const testObjects: { [test: string]: { clicks: number, expect: any, initial?: string } } = {
        passive: {clicks: 1, expect: true},
        once: {clicks: 2, expect: 1, initial: '0'},
        preventDefault: {clicks: 1, expect: true},
        ngZone: {clicks: 1, expect: true},
        capture: {clicks: 1, expect: true},
        stop: {clicks: 1, expect: 1, initial: '-1'}
    };

    let page: AppPage;

    beforeEach(() => {
        page = new AppPage();
        page.navigateTo();
    });

    Object.keys(testObjects).forEach(test => {
        it(`should create a ${test} event`, () => {
            const id: string = `${test}Test`;
            const testObject: { clicks: number, expect: any, initial?: string } = testObjects[test];
            const testElement = page.getTestElement(id);
            expect(testElement.getText()).toEqual(testObject.initial || id);
            for (let i = 0; i < testObject.clicks; i++) {
                testElement.click();
            }
            expect(testElement.getText()).toEqual(testObject.expect.toString());
        });
    });
});
