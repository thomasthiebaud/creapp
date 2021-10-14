const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { appHtml, appTsConfig } = require("@creapp/core");

function getConfig(env = process.env.NODE_ENV) {
  const isProd = env === "production";
  const isDev = !isProd;
  const useTypeScript = fs.existsSync(appTsConfig);

  function getStyleLoaders(cssConfig, preProcessor) {
    const loaders = [
      isDev && require.resolve("style-loader"),
      isProd && MiniCssExtractPlugin.loader,
      {
        loader: require.resolve("css-loader"),
        options: cssConfig,
      },
      {
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            plugins: [require.resolve("postcss-preset-env")],
          },
        },
      },
      preProcessor && require.resolve("resolve-url-loader"),
      preProcessor && {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
        },
      },
    ].filter(Boolean);

    return loaders;
  }

  const config = {
    mode: isProd ? "production" : "development",
    devtool: isProd ? "source-map" : "cheap-module-source-map",
    output: {
      clean: isProd,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    optimization: {
      minimize: isProd,
      minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
      splitChunks: {
        chunks: "all",
      },
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [
            {
              test: /\.(bmp|png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
              type: "asset",
            },
            {
              test: /\.module\.css$/,
              use: getStyleLoaders({
                importLoaders: 1,
                modules: true,
              }),
            },
            {
              test: /\.module\.(scss|sass)$/,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                  modules: true,
                },
                "sass-loader"
              ),
            },
            {
              test: /\.css$/,
              use: getStyleLoaders({
                importLoaders: 1,
              }),
            },
            {
              test: /\.(scss|sass)$/,
              use: getStyleLoaders(
                {
                  importLoaders: 3,
                },
                "sass-loader"
              ),
            },
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              exclude: /(node_modules|bower_components)/,
              loader: require.resolve("babel-loader"),
              options: {
                assumptions: {
                  setPublicClassFields: true,
                  privateFieldsAsProperties: true,
                },
                presets: [
                  [
                    require.resolve("@babel/preset-env"),
                    {
                      useBuiltIns: "entry",
                      corejs: 3,
                    },
                  ],
                  [
                    require.resolve("@babel/preset-react"),
                    {
                      runtime: "automatic",
                    },
                  ],
                  require.resolve("@babel/preset-typescript"),
                ],
                plugins: [
                  require.resolve("@babel/plugin-proposal-class-properties"),
                  require.resolve("@babel/plugin-proposal-private-methods"),
                  require.resolve(
                    "@babel/plugin-proposal-private-property-in-object"
                  ),
                  require.resolve("@babel/plugin-transform-runtime"),
                  isProd && [
                    require.resolve(
                      "babel-plugin-transform-react-remove-prop-types"
                    ),
                    {
                      removeImport: true,
                    },
                  ],
                ].filter(Boolean),
                compact: isProd,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: appHtml }),
      new CaseSensitivePathsPlugin(),
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            typescriptPath: require.resolve("typescript"),
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
            mode: "write-references",
          },
        }),
      isProd && new MiniCssExtractPlugin(),
    ].filter(Boolean),
    devServer: {
      historyApiFallback: true,
    },
  };

  return config;
}

module.exports = getConfig;
