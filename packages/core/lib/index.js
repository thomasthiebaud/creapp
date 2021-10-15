const path = require("path");
const fs = require("fs");
const { EOL } = require("os");
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

function log(msg, newLine = true) {
  process.stdout.write(msg);

  if (newLine) {
    process.stdout.write(EOL);
  }
}

module.exports = {
  appPath: resolveApp("."),
  appHtml: resolveApp("index.html"),
  appTsConfig: resolveApp("tsconfig.json"),
  log,
};
