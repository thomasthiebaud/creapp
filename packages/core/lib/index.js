const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = {
  appPath: resolveApp("."),
  appBuild: resolveApp("dist"),
  appHtml: resolveApp("index.html"),
  appNodeModules: resolveApp("node_modules"),
  appTsConfig: resolveApp("tsconfig.json"),
};
