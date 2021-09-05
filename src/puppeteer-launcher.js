const { createCompareFn } = require('./snapshot-compare');
const markTouchedFile = require('./outdated-snapshot-reporter').markTouchedFile;

module.exports = {
  'launcher:SnapshotPuppeteer': ['type', function(/* baseBrowserDecorator */ baseBrowserDecorator, /* args */ args, /*config.snapshot*/compareOptions) {
    const compare = createCompareFn(compareOptions || {});
    const ChromeHeadless = require('karma-chrome-launcher')['launcher:ChromeHeadless'][1];
    ChromeHeadless.apply(this, arguments);

    let browser = null;
    let screenshots = {};
    this._start = async (url) => {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({ args: this._getOptions('') });
      const page = await browser.newPage();
      await page.exposeFunction('setViewport', (options) => {
        page.setViewport(options);
      });
      await page.exposeFunction('screenshot', async (options) => {
        const crypto = require('crypto');
        const id = crypto.randomBytes(16).toString('hex');
        screenshots[id] = await page.screenshot(options);
        return id;
      });
      await page.exposeFunction('toMatchImageSnapshot', (screenshotId, options) => compare(screenshots[screenshotId], { markTouchedFile, ...options }));
      await page.goto(url);
    };

    this.on('kill', async (done) => {
      if (browser != null) {
        console.log('Closing puppeteer browser.');
        await browser.close();
        screenshots = null;
        browser = null;
      }
      done();
    });
  }]
};