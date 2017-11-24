// @attention 当使用该插件，并同时使用 webpack.optimize.UglifyJsPlugin 时，结果有问题
// 有可能应为 webpack 版本的问题，导致压缩结果不一样，需要修改正则部分代码

'use strict';

const debug = require('debug');
const ConcatSource = require("webpack/lib/ConcatSource");

const amd2cmdDebug = debug('webpack-plugin-amd2cmd');

/**
 * webpack plugin - 将 AMD 转化成 CMD 模块（包含冗余星系）
 * 
 * @param {any} options 
 */
function AmdTemplate(options) {
  this.options = options;
}

AmdTemplate.prototype.apply = function (compiler) {

  let options = this.options || {};
  amd2cmdDebug(options);

  // 拼接模块名
  const webpackBundleName = Object.keys(compiler.options.entry)[0];
  let modName = `"${options.groupName}/${options.modName}/${webpackBundleName}"`;
  if (!options.groupName) {
    modName = `"${options.modName}/${webpackBundleName}"`;
  }
  if (!options.modName) {
    modName = `"${webpackBundleName}"`;
  }
  
  /**
   * 编译时，将 AMD 相关的 _WEBPACK_EXTERNAL_MODULE_ 提换成模块名
   * 
   *   - chunk.modules[].external.amd?
   */
  compiler.plugin("this-compilation", function (compilation) {
    
    const mainTemplate = compilation.mainTemplate;

    // 将 AMD 规则替换成 CMD，require 的资源全部前置
    compilation.templatesPlugin("render-with-entry", function (source, chunk, hash) {
      const externals = chunk.modules.filter(function (m) {
        return m.external;
      });
      let externalsDepsArray = externals.map(function (m) {
        return typeof m.request === "object" ? m.request.amd : m.request;
      });
      const externalsArguments = externals.map(function (m) {
        return "__WEBPACK_EXTERNAL_MODULE_" + m.id + "__";
      });
      const requires = externalsDepsArray.map(function (mod, index) {
        return '  try{\n    var ' + externalsArguments[index] + ' = require("' + mod + '");\n  } cache(e) {}\n';
      }).join('');
      
      amd2cmdDebug(externalsDepsArray, webpackBundleName);
      // 将分析出来的 deps 文件写到 deps.json
      options.dealDeps && options.dealDeps(externalsDepsArray, webpackBundleName, options);

      externalsDepsArray = externalsDepsArray.map(function (mod) {
        return '  "' + mod + '"';
      }).join(',\n');
      return new ConcatSource('define(' + modName + ', [\n' + externalsDepsArray +
        '\n], function(require, exports, module) {\n\n' + requires +
        '\n  return  module.exports = \n\n', source, '});');

    }.bind(this));

    /**
     * 上一步替换后，包含了多余的代码，通过正则全部修正
     *  
     *  - Compilation.assets[key].source
     */
    compiler.plugin('emit', function (Compilation, callback) {
      var assets = Compilation.assets;
      for (var name in assets) {
        if (!/\.js$/.test(name)) continue;
        var source = assets[name].source();
        // 代码修正处理函数
        Compilation.assets[name].source = function (source) {
          return function () {
            // amd 去头
            source = source.replace(/define[\s\S]+?define/, 'define');
            // amd 去尾
            source = source.replace(/\}\);\}\);;$/, '\n\n});');
            // 替换名字
            // source = source.replace(/define\(\"(\S*?)\",/, 'define("' + name + '",');
            return source;
          }
        }(source);
      }
      callback();
    }.bind(this));

    mainTemplate.plugin("global-hash-paths", function (paths) {
      if (modName) paths.push(modName);
      return paths;
    }.bind(this));

    mainTemplate.plugin("hash", function (hash) {
      hash.update("exports amd");
      hash.update(modName);
    }.bind(this));

  }.bind(this));

};

module.exports = AmdTemplate;