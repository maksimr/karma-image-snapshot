const path = require('path');
const fs = require('fs');

let touchedFiles = {};
let imageSnapshotDirectories = {};
module.exports = {
  markTouchedFile: (file) => {
    touchedFiles[file] = true;
    imageSnapshotDirectories[path.dirname(file)] = true;
  },

  'reporter:outdated-snapshot': ['type', function(baseReporterDecorator) {
    baseReporterDecorator(this);

    this.renderBrowser =
      this.onBrowserError =
      this.onBrowserLog =
      this.onBrowserComplete =
      this.onSpecComplete =
      this.onRunComplete =
      this.specFailure =
      this.specSuccess =
      this.specSkipped = function() {
      };

    this.onRunComplete = function(browsers, results) {
      if (browsers.length < 1 || results.disconnected || results.error || results.failed) {
        return;
      }

      const obsoleteFiles = Object.keys(imageSnapshotDirectories)
        .map(dir => fs.readdirSync(dir).map(file => path.join(dir, file)))
        .reduce((a, b) => a.concat(b), [])
        .filter(file => file.endsWith('-snap.png'))
        .filter(file => !touchedFiles[file]);

      obsoleteFiles.forEach((file) => {
        // @ts-ignore
        this.write('Deleting outdated snapshot "%s"...\n', file);
        fs.unlinkSync(file);
      });

      touchedFiles = {};
      imageSnapshotDirectories = {};
    };
  }]
};