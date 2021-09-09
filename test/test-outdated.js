const { strictEqual } = require('assert');
const OUTDATED_FILE_PATH = require('path').resolve(__dirname, './__image_snapshots__/outdated-image-snap.png');

require('fs').writeFileSync(OUTDATED_FILE_PATH, '');
require('child_process').execSync('npm run test:full');
strictEqual(require('fs').existsSync(OUTDATED_FILE_PATH), false, 'It should remove outdated file');