module.exports = function(config) {
  const snapshotDir = require('path').resolve(__dirname, '__image_snapshots__');
  const files = [
    { pattern: 'test/**/*.e2e.js', watched: true }
  ];

  config.set({
    basePath: '../',
    frameworks: ['snapshot-jasmine', 'jasmine'],
    files: files,
    plugins: [
      'karma-*',
      require('../src/index')
    ],
    snapshot: {
      driver: process.env.PW ?
        require('playwright').chromium :
        require('puppeteer'),
      customSnapshotsDir: snapshotDir
    },
    customLaunchers: {
      Browser_no_hinting: {
        base: 'SnapshotBrowser',
        flags: ['--font-render-hinting=none', '--no-sandbox']
      }
    },
    reporters: ['progress', 'outdated-snapshot'],
    autoWatch: true,
    browsers: ['Browser_no_hinting'],
    singleRun: true
  });
};