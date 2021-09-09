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
      customSnapshotsDir: snapshotDir
    },
    customLaunchers: {
      Chrome: {
        base: 'SnapshotLauncher',
        driver: require('puppeteer'),
        flags: ['--font-render-hinting=none', '--no-sandbox']
      },
      Chromium: {
        base: 'SnapshotLauncher',
        driver: require('playwright').chromium,
        flags: ['--font-render-hinting=none', '--no-sandbox']
      },
      Firefox: {
        base: 'SnapshotLauncher',
        driver: require('playwright').firefox,
        flags: ['--font-render-hinting=none', '--no-sandbox']
      }
    },
    reporters: ['progress', 'outdated-snapshot'],
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: true
  });
};
