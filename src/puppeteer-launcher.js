const { createCompareFn } = require('./snapshot-compare');
const markTouchedFile = require('./outdated-snapshot-reporter').markTouchedFile;

module.exports = {
  'launcher:SnapshotPuppeteer': ['type', /**@this {*}*/function(/* baseBrowserDecorator */ baseBrowserDecorator, /* args */ args, /*config.snapshot*/compareOptions) {
    baseBrowserDecorator(this);

    const compare = createCompareFn(compareOptions || {});
    let browser = null;
    let screenshots = /**@type {Object|null}*/({});
    const flags = args.flags || [];
    const userDataDir = args.chromeDataDir || this._tempDir;

    this._getOptions = (url) => {
      flags.forEach(function(flag, i) {
        if (isJSFlags(flag)) {
          flags[i] = sanitizeJSFlags(flag);
        }
      });
      const mergedArgs = [
        '--user-data-dir=' + userDataDir,
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