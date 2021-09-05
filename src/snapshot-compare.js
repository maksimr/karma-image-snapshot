const path = require('path');
const { diffImageToSnapshot, runDiffImageToSnapshot } = require('jest-image-snapshot/src/diff-snapshot');
const updateSnapshotDefault = Boolean(process.argv.find((arg) => /^\s*(--updateSnapshot|-u)\s*$/.test(arg)));
const SNAPSHOTS_DIR = '__image_snapshots__';

/**
 * @typedef SnapshotCompareOptions
 * @property {{fullName: string}} currentSpec
 * @property {Object} [customDiffConfig]
 * @property {string} [customSnapshotsDir]
 * @property {string} [customDiffDir]
 * @property {'horizontal'|'vertical'} [diffDirection]
 * @property {number} [failureThreshold]
 * @property {'pixel'|'percent'} [failureThresholdType]
 * @property {boolean} [updatePassedSnapshot]
 * @property {boolean} [updateSnapshot]
 * @property {boolean} [allowSizeMismatch]
 * @property {number} [blur]
 * @property {boolean} [runInProcess]
 * @property {'pixelmatch'|'ssim'} [comparisonMethod]
 * @property {function} [markTouchedFile]
 */

module.exports.createCompareFn = (defaultOptions = /**@type {SnapshotCompareOptions}*/({})) => (actula, options = /**@type {SnapshotCompareOptions}*/({})) => compare(actula, { ...defaultOptions, ...options });

/**
 * 
 * @param {*} actual 
 * @param {SnapshotCompareOptions} options 
 * @returns {{message: string, pass: boolean}}
 */
function compare(actual, {
  currentSpec,
  customDiffConfig = {},
  customSnapshotsDir = path.join(path.dirname(__filename), SNAPSHOTS_DIR),
  customDiffDir,
  diffDirection = 'horizontal',
  failureThreshold = 0,
  failureThresholdType = 'pixel',
  updatePassedSnapshot = false,
  updateSnapshot = updateSnapshotDefault,
  blur = 0,
  runInProcess = false,
  allowSizeMismatch = false,
  comparisonMethod = 'pixelmatch',
  markTouchedFile
}) {
  const snapshotIdentifier = currentSpec.fullName.replace(/\s+/g, '_');
  const snapshotsDir = customSnapshotsDir;
  const diffDir = customDiffDir || path.join(snapshotsDir, '__diff_output__');
  const imageToSnapshot = runInProcess ? diffImageToSnapshot : runDiffImageToSnapshot;
  const baselineSnapshotPath = path.join(snapshotsDir, `${snapshotIdentifier}-snap.png`);

  if (markTouchedFile) {
    markTouchedFile(baselineSnapshotPath);
  }

  const result = imageToSnapshot({
    receivedImageBuffer: actual,
    snapshotsDir,
    diffDir,
    diffDirection,
    snapshotIdentifier,
    updateSnapshot: updateSnapshot,
    customDiffConfig: Object.assign({}, customDiffConfig),
    failureThreshold,
    failureThresholdType,
    updatePassedSnapshot,
    blur,
    allowSizeMismatch,
    comparisonMethod
  });


  let pass = true;
  let message = '';
  if (!result.updated && !result.added) {
    ({ pass } = result);
    if (!pass) {
      const differencePercentage = result.diffRatio * 100;
      message = (result.diffSize && !allowSizeMismatch ?
        `Expected image to be the same size as the snapshot (${result.imageDimensions.baselineWidth}x${result.imageDimensions.baselineHeight}), but was different (${result.imageDimensions.receivedWidth}x${result.imageDimensions.receivedHeight}).\n` :
        `Expected image to match or be a close match to snapshot but was ${differencePercentage}% different from snapshot (${result.diffPixelCount} differing pixels).\n`)
        + `${('See diff for details:')} ${(result.diffOutputPath)}`;
    }
  }
  return {
    message,
    pass
  };
};