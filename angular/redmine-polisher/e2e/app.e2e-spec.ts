import { RedminePolisherPage } from './app.po';

describe('redmine-polisher App', () => {
  let page: RedminePolisherPage;

  beforeEach(() => {
    page = new RedminePolisherPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
