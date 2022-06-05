module.exports = function(/**@type {*}*/config) {
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
      customSnapshotsDir: snapshotDir
    },
    customLaunchers: {
      Chrome: {
        base: 'SnapshotHeadlessLauncher',
        browserType: require('puppeteer'),
        flags: ['--font-render-hinting=none', '--no-sandbox']
      },
      Chromium: {
        base: 'SnapshotHeadlessLauncher',
        browserType: require('playwright').chromium,
        flags: ['--font-render-hinting=none', '--no-sandbox']
      },
      Firefox: {
        base: 'SnapshotHeadlessLauncher',
        browserType: require('playwright').firefox,
        flags: ['--font-render-hinting=none', '--no-sandbox']
      }
    },
    reporters: ['progress', 'outdated-snapshot'],
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true
  });
};
