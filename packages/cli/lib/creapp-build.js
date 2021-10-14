const program = require("commander");
const path = require("path");
const webpack = require("webpack");

const { appPath } = require("@creapp/core");

program
  .option("-c, --config <value>", "Webpack config to use", "webpack.config.js")
  .parse(process.argv);

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
  console.log(stats.toString(config.stats || {}));
}

compile()
  .then(printStats)
  .catch((err) => {
    console.error(err.message);
  });
