jasmine.getEnv().addReporter({
  specStarted(spec) {
    jasmine.getEnv().currentSpec = spec;
  },

  specDone() {
    jasmine.getEnv().currentSpec = null;
  }
});

const IMAGE_SNAPSHOT_NOT_SUPPORTED = -1;
if (typeof window.screenshot === 'undefined') {
  window.screenshot = () => IMAGE_SNAPSHOT_NOT_SUPPORTED;
}

beforeAll(() => {
  if (window.parent) {
    ['banner', 'browsers'].forEach((id) => {
      const node = window.parent.document.getElementById(id);
      if (node) {
        node.style.display = 'none';
      }
    });
  }

  jasmine.addAsyncMatchers({
    toMatchImageSnapshot: function() {
      return {
        async compare(actual, options) {
          if (actual === IMAGE_SNAPSHOT_NOT_SUPPORTED) {
            return {
              pass: false,
              message: 'Browser does not support snapshot. Make sure that you run puppeteer with exposed "screenshot" functionality'
            };
          }

          return await window.toMatchImageSnapshot(actual, {
            currentSpec: jasmine.getEnv().currentSpec,
            ...options
          });
        }
      };
    }
  });
});