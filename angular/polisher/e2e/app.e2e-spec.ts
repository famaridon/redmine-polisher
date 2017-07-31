import { PolisherPage } from './app.po';

describe('polisher App', () => {
  let page: PolisherPage;

  beforeEach(() => {
    page = new PolisherPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
