const { createCompareFn } = require('./snapshot-compare');
const markTouchedFile = require('./outdated-snapshot-reporter').markTouchedFile;

/**
 * @param {*} baseBrowserDecorator 
 * @param {*} args 
 * @param {*} compareOptions 
 */
const SnapshotLauncher = /**@this {*}*/function(/* baseBrowserDecorator */ baseBrowserDecorator, /* args */ args, /*config.snapshot*/compareOptions) {
  baseBrowserDecorator(this);

  const driver = args?.driver ?? require('puppeteer');
  const options = args?.options ?? {};
  const driverName = driver.product ?? driver.name?.();
  const compare = createCompareFn(compareOptions || {});
  /**@type {any}*/
  let browser = null;
  /**@type {Object<string,string>|null}*/
  let screenshots = {};
  const flags = args.flags || [];

  this.name = driverName;

  this._getOptions = (/**@type {string}*/url) => {
    flags.forEach(function(/**@type {string}*/flag, /**@type {number}*/i) {
      if (isJSFlags(flag)) {
        flags[i] = sanitizeJSFlags(flag);
      }
    });
    const mergedArgs = [
      '--enable-automation',
      '--no-default-browser-check',
      '--no-first-run',
      '--disable-popup-blocking',
      '--disable-translate',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-device-discovery-notifications'
    ].concat(flags, [url]);

    return mergedArgs.some(isRemoteDebuggingFlag)
      ? mergedArgs
      : mergedArgs.concat(['--remote-debugging-port=9222']);

    function isRemoteDebuggingFlag(/**@type {string}*/flag) {
      return flag.indexOf('--remote-debugging-port=') !== -1;
    }

    function isJSFlags(/**@type {string}*/flag) {
      return flag.indexOf('--js-flags=') === 0;
    }

    function sanitizeJSFlags(/**@type {string}*/flag) {
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

  this._start = async (/**@type {string}*/url) => {
    screenshots = screenshots ?? {};
    browser = await driver.launch({
      args: this._getOptions(''),
      ...options
    });
    const page = await browser.newPage();
    await page.exposeFunction('setViewport', async (/**@type {*}*/options) => {
      const setViewport = page.setViewport ?? page.setViewportSize;
      await setViewport.call(page, options);
    });
    await page.exposeFunction('screenshot', async ({ name = null, ...options } = {}) => {
      const crypto = require('crypto');
      const id = name ?? crypto.randomBytes(16).toString('hex');
      if (screenshots) {
        screenshots[id] = await page.screenshot(options);
      }
      return id;
    });
    await page.exposeFunction('toMatchImageSnapshot', (/**@type {string}*/screenshotId, /**@type {*}*/options) => compare(screenshots?.[screenshotId], { markTouchedFile, ...options }));
    await page.goto(url);
  };

  this.on('kill', async (/**@type {*}*/done) => {
    if (browser != null) {
      console.log(`Closing ${driverName} browser.`);
      await browser.close();
      screenshots = null;
      browser = null;
    }
    done();
  });
};

/**
 * @param {*} baseBrowserDecorator 
 * @param {*} args 
 * @param {*} compareOptions 
 */
const SnapshotHeadlessLauncher = /**@this {*}*/function(/* baseBrowserDecorator */ baseBrowserDecorator, /* args */ args, /*config.snapshot*/compareOptions) {
  SnapshotLauncher.call(this, baseBrowserDecorator, args, compareOptions);
  const parentOptions = this._getOptions;
  this._getOptions = (/**@type {string[]}*/...args) => {
    return [
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ].concat(parentOptions.call(this, ...args));
  };
};

module.exports = {
  'launcher:SnapshotLauncher': ['type', SnapshotLauncher],
  'launcher:SnapshotHeadlessLauncher': ['type', SnapshotHeadlessLauncher]
};
