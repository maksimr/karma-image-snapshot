module.exports = {
  'framework:snapshot-jasmine': ['factory', function(/* config.files */ files) {
    files.unshift(
      {
        pattern: require.resolve('./snapshot.js'),
        included: true,
        served: true,
        watched: false
      }
    );
  }]
};