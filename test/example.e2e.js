describe('example', () => {
  beforeAll(() => {
    // @ts-ignore
    window.setViewport({width: 800, height: 600});
  });

  let rootNode;
  beforeEach(function() {
    rootNode = document.createElement('div');
    document.body.appendChild(rootNode);
  });

  afterEach(function() {
    document.body.removeChild(rootNode);
  });

  it('should compare image snapshots', async function() {
    rootNode.innerHTML = '<svg><circle fill="red" cx="25" cy="75" r="20"/></svg>';
    // @ts-ignore
    const image = await window.screenshot();
    // @ts-ignore
    await expectAsync(image).toMatchImageSnapshot();
  });

  it('should not match if snapshots are diffirent', async function() {
    rootNode.innerHTML = '<svg><circle fill="red" cx="25" cy="75" r="20"/></svg>';
    // @ts-ignore
    const image = await window.screenshot();
    // @ts-ignore
    await expectAsync(image).not.toMatchImageSnapshot();
  });
});