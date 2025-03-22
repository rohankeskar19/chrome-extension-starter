"use strict";

const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const eslintFormatter = require("react-dev-utils/eslintFormatter");
const TerserPlugin = require("terser-webpack-plugin");

const paths = require("./paths");
const getClientEnvironment = require("./env");

const publicPath = paths.servedPath;

const shouldMinimize = false;

const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified["process.env"].NODE_ENV !== '"production"') {
  throw new Error("Production builds must have NODE_ENV=production.");
}

const cssFilename = "static/css/[name].css";

module.exports = {
  mode: "production",
  target: ["web", "es5"],
  bail: true,
  devtool: false,
  entry: {
    app: [require.resolve("./polyfills"), paths.appIndexJs],
    content: [require.resolve("./polyfills"), "./src/content.js"],
  },
  optimization: {
    minimize: shouldMinimize,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: 6,
          parse: {},
          compress: {},
          mangle: true, // Note: `safari10` is default in Webpack 5
          output: {
            ascii_only: true,
          },
        },
        extractComments: false,
      }),
    ],
    // Add splitChunks configuration
    splitChunks: {
      chunks: "all",
      name: false,
    },
    // Add runtimeChunk
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },
  output: {
    path: paths.appBuild,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].[chunkhash:8].chunk.js",
    publicPath: publicPath,
    devtoolModuleFilenameTemplate: (info) =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, "/"),
  },
  resolve: {
    modules: ["node_modules", paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
    ),
    extensions: [".web.js", ".mjs", ".js", ".json", ".web.jsx", ".jsx"],
    alias: {
      "react-native": "react-native-web",
    },
    plugins: [],

    fallback: {
      crypto: false,
      stream: false,
      assert: false,
      http: false,
      https: false,
      zlib: false,
      fs: false,
      path: false,
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: "pre",
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve("eslint"),
            },
            loader: require.resolve("eslint-loader"),
          },
        ],
        include: paths.appSrc,
      },
      {
        test: /\.(js|mjs)$/,
        include: /node_modules\/chrono-node/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        oneOf: [
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
            resolve: {
              fullySpecified: false,
            },
          },
          {
            test: /\.svg$/,
            use: {
              loader: "svg-url-loader",
              options: {
                encoding: "base64",
              },
            },
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10000,
              },
            },
            generator: {
              filename: "static/media/[name][ext]",
            },
          },
          {
            test: /\.(js|jsx|mjs|cjs)$/,
            include: paths.appSrc,
            exclude: "/node_modules/",
            loader: require.resolve("babel-loader"),
            options: {
              compact: true,
            },
          },
          {
            test: /\.s[sc]ss$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              require.resolve("css-loader"),
              require.resolve("sass-loader"),
            ],
          },
          {
            test: /\.css$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              "css-loader",
              {
                loader: require.resolve("postcss-loader"),
                options: {
                  postcssOptions: {
                    plugins: [
                      // Import tailwindcss properly
                      ["@tailwindcss/postcss", {}],
                      ["autoprefixer", {}],
                    ],
                  },
                },
              },
            ],
          },
          {
            exclude: [/\.(js|jsx|mjs|cjs)$/, /\.html$/, /\.json$/],
            type: "asset/resource",
            generator: {
              filename: "static/media/[name][ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      filename: "index.html",
      chunks: ["app"],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new webpack.DefinePlugin(env.stringified),
    new MiniCssExtractPlugin({
      filename: cssFilename,
    }),

    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      exclude: [/\.map$/, /asset-manifest\.json$/],
      navigateFallback: publicUrl + "/index.html",
      navigateFallbackDenylist: [/^(?!\/__).*/],
      swDest: "service-worker.js",
    }),

    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};
