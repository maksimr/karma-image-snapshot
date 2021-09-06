# karma-image-snapshot [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/maksimr/karma-image-snapshot)

Jasmine matcher that performs image comparisons based
on [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot) for visual regression testing

## How to use

```js
/** karma.config.js*/
module.exports = function(config) {
  config.set({
    frameworks: ['snapshot-jasmine', 'jasmine'],
    /*...*/
    snapshot: {
      customSnapshotsDir: require('path').resolve(__dirname, '__image_snapshots__')
    },
    browsers: ['SnapshotPuppeteer']
  });
};
```

If you want to automatically remove outdated snapshots you should add special reporter

```js
/** karma.config.js*/
module.exports = function(config) {
  config.set({
    /*...*/
    reporters: [/*...*/, 'outdated-snapshot']
  });
};
```

Now in you can use `window.screenshot`, `window.setViewport` functions and asynchronous jasmine matcher `toMatchImageSnapshot`

```js
/** example.e2e.js*/
it('should compare image snapshots', async function() {
  /*...*/
  const image = await window.screenshot();
  await expectAsync(image).toMatchImageSnapshot();
});
```

Working configuration and test example you can find in `test` directory
