import { AppPage } from './app.po';

describe('ng-event-options App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display button with text Click', () => {
    page.navigateTo();
    expect(page.getButtonText()).toEqual('Click');
  });
});
