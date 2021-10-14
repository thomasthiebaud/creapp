const program = require("commander");
const webpack = require("webpack");
const path = require("path");
const WebpackDevServer = require("webpack-dev-server");

program
  .option("-c, --config <value>", "Webpack config to use", "webpack.config.js")
  .parse(process.argv);

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const options = program.opts();
const config = require(path.resolve(process.cwd(), options.config));

const compiler = webpack(config);
const devServer = new WebpackDevServer(config.devServer || {}, compiler);

devServer.start().catch((err) => {
  console.error(err);
});
