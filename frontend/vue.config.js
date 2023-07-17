const path = require('path');
const fs = require('fs');
// function resolveSrc(_path) {
//   return path.join(__dirname, _path);
// }
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.plugin("copy").tap(([options]) => {
      var ignore_txt = fs.readFileSync("./ignore.txt","utf-8");
      var ignore_list = ignore_txt.split(",");

      for(var ignore of ignore_list){
        options[0].ignore.push(ignore+"/**");
      }

      return [options];
    });
  },
  // chainWebpack: (config) => {
  //   config.plugin("copy").tap(([options]) => {
  //     options.patterns[0].globOptions.ignore.push("public/**");
  //     return [options];
  //   });
  // },
  outputDir: "../backend/dist",
  devServer: {
    proxy: {
      '/dao': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/upload': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/my-uploadPdf': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/public': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/main': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/material1': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/material2': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/monitoring1': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      '/monitoring2': {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    }
  }
  // configureWebpack: {
  //   // Set up all the aliases we use in our app.

  //   resolve: {
  //     alias: {
  //       assets: resolveSrc('src/assets')
  //     }
  //   }
  // },
  // css: {
  //   // Enable CSS source maps.
  //   sourceMap: process.env.NODE_ENV !== 'production'
  // },
  // // 빌드 결과물 저장 경로 변경 옵션
  // outputDir: path.resolve(__dirname, '../backend/dist'),
  // devServer: {
  //   // Template for index.html
  //   // index: path.resolve(__dirname, '../dist/index.html'),
  //   index: path.resolve(__dirname, '../backend/dist/index.html'),

  //   // Paths
  //   // assetsRoot: path.resolve(__dirname, '../dist'),
  //   assetsRoot: path.resolve(__dirname, '../backend/dist'),
  //   assetsSubDirectory: 'static',
  //   assetsPublicPath: '/',

  //   /**
  //    * Source Maps
  //    */

  //   productionSourceMap: true,
  //   // https://webpack.js.org/configuration/devtool/#production
  //   devtool: '#source-map',

  //   // Gzip off by default as many popular static hosts such as
  //   // Surge or Netlify already gzip all static assets for you.
  //   // Before setting to `true`, make sure to:
  //   // npm install --save-dev compression-webpack-plugin
  //   productionGzip: false,
  //   productionGzipExtensions: ['js', 'css'],

  //   // Run the build command with an extra argument to
  //   // View the bundle analyzer report after build finishes:
  //   // `npm run build --report`
  //   // Set to `true` or `false` to always turn it on or off
  //   bundleAnalyzerReport: process.env.npm_config_report
  // },
};
