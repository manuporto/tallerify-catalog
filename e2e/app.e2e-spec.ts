import { TallerifyCatalogPage } from './app.po';

describe('tallerify-catalog App', () => {
  let page: TallerifyCatalogPage;

  beforeEach(() => {
    page = new TallerifyCatalogPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
