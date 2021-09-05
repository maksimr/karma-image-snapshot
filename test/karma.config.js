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
      Puppeteer_no_hinting: {
        base: 'SnapshotPuppeteer',
        flags: ['--font-render-hinting=none', '--no-sandbox']
      }
    },
    reporters: ['progress', 'outdated-snapshot'],
    autoWatch: true,
    browsers: ['Puppeteer_no_hinting'],
    singleRun: true
  });
};