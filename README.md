# Webpack Plugin - Amd2Cmd

A webpack plugin - Transfer amd bundle to cmd.

## Usage

```js
const Amd2Cmd = require('webpack-plugin-amd2cmd');

module.exports = {
  entry: {
    // ...
  },
  output: {
    // ...
  },
  // ...
  plugins: [
    new Amd2Cmd({
      groupName: "GROUPNAME",
      modName: "MODNAME",
      dealDeps: function(deps, bundleName) {
        // saveDeps()
      }
    })
  ],
}
```

## Attention

- Using amd2cmd plugin with webpack.optimize.UglifyJsPlugin, the result have some problem;
- Maybe the result is relative to the version of webpack, if there is a problem, please modify the replace REG

## License

MIT License.