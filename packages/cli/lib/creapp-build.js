const program = require("commander");
const webpack = require("webpack");
const path = require("path");
const chalk = require("chalk");
const filesize = require("filesize");

const { appPath } = require("@creapp/core");
const log = console.log;

program
  .option("-c, --config <value>", "Webpack config to use", "webpack.config.js")
  .parse(process.argv);

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const options = program.opts();
const config = require(path.join(appPath, options.config));

async function compile() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);

    compiler.run((err, stats) => {
      if (err) return reject(err);

      compiler.close((err) => {
        if (err) return reject(err);
        return resolve(stats);
      });
    });
  });
}

function printStats(stats) {
  const details = stats.toJson({
    all: false,
    assets: true,
    errors: true,
    warnings: true,
  });
  if (stats.hasErrors()) {
    for (const error of details.errors) {
      error.moduleName
        ? log(chalk`{red.bold Error} in {bold ${error.moduleName}}`)
        : log(chalk`{red.bold Error}`);
      log(`${error.message}\n`);
    }
  }

  if (stats.hasWarnings()) {
    for (const warning of details.warnings) {
      warning.moduleName
        ? log(chalk`{yellow.bold Warning} in {bold ${warning.moduleName}}`)
        : log(chalk`{yellow.bold Warning}`);
      log(`${warning.message}\n`);
    }
  }

  if (!stats.hasErrors()) {
    const assets = [];

    for (const asset of details.assets) {
      assets.push({
        ...asset,
        size: filesize(asset.size),
      });
    }

    const longestSize = assets.reduce((acc, cur) => {
      if (cur.size.length > acc) acc = cur.size.length;
      return acc;
    }, 0);

    log(chalk`{green.bold Compiled successfully}`);
    assets.forEach((asset) => {
      const sizeLength = asset.size.length;
      const padding =
        sizeLength < longestSize
          ? " ".repeat(longestSize - sizeLength + 1)
          : " ";
      if (asset.isOverSizeLimit) {
        log(
          chalk`${asset.size}${padding}{cyan ${asset.name}} {yellow.bold [BIG]}`
        );
      } else {
        log(chalk`${asset.size}${padding}{cyan ${asset.name}}`);
      }
    });
  }
}

compile()
  .then(printStats)
  .catch((err) => {
    console.error(err.message);
  });
