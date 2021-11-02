module.exports = {
  'framework:snapshot-jasmine': ['factory',
    /**
     * @param {*} files 
     */
    function(/* config.files */ files) {
      files.unshift(
        {
          pattern: require.resolve('./snapshot.js'),
          included: true,
          served: true,
          watched: false
        }
      );
    }
  ]
};