const { createCompareFn } = require('./snapshot-compare');
const markTouchedFile = require('./outdated-snapshot-reporter').markTouchedFile;

module.exports = {
  'launcher:SnapshotBrowser': ['type', /**@this {*}*/function(/* baseBrowserDecorator */ baseBrowserDecorator, /* args */ args, /*config.snapshot*/compareOptions) {
    baseBrowserDecorator(this);

    const driver = compareOptions?.driver ?? require('puppeteer');
    const compare = createCompareFn(compareOptions || {});
    let browser = null;
    let screenshots = /**@type {Object|null}*/({});
    const flags = args.flags || [];

    this._getOptions = (url) => {
      flags.forEach(function(flag, i) {
        if (isJSFlags(flag)) {
          flags[i] = sanitizeJSFlags(flag);
        }
      });
      const mergedArgs = [
        '--enable-automation',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-popup-blocking',
        '--disable-translate',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-device-discovery-notifications',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ].concat(flags, [url]);

      return mergedArgs.some(isRemoteDebuggingFlag)
        ? mergedArgs
        : mergedArgs.concat(['--remote-debugging-port=9222']);

      function isRemoteDebuggingFlag(flag) {
        return flag.indexOf('--remote-debugging-port=') !== -1;
      }

      function isJSFlags(flag) {
        return flag.indexOf('--js-flags=') === 0;
      }

      function sanitizeJSFlags(flag) {
        var test = /--js-flags=(['"])/.exec(flag);
        if (!test) {
          return flag;
        }
        var escapeChar = test[1];
        var endExp = new RegExp(escapeChar + '$');
        var startExp = new RegExp('--js-flags=' + escapeChar);
        return flag.replace(startExp, '--js-flags=').replace(endExp, '');
      }
    };

    this._start = async (url) => {
      browser = await driver.launch({ args: this._getOptions('') });
      const page = await browser.newPage();
      await page.exposeFunction('setViewport', async (options) => {
        const setViewport = page.setViewport ?? page.setViewportSize;
        await setViewport.call(page, options);
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
        console.log('Closing browser.');
        await browser.close();
        screenshots = null;
        browser = null;
      }
      done();
    });
  }]
};