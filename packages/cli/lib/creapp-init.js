const path = require("path");
const { exec } = require("child_process");
const prompts = require("prompts");
const validatePackageName = require("validate-npm-package-name");
const fs = require("fs-extra");
const { promisify } = require("util");
const { log } = require("@creapp/core");
const chalk = require("chalk");

const execAsync = promisify(exec);

async function run() {
  const baseDir = process.cwd();
  const response = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "What is the name of your project?",
        validate: (name) => {
          if (!validatePackageName(name).validForNewPackages) {
            return `${name} is not a valid project name`;
          }
          if (fs.existsSync(path.join(baseDir, name))) {
            return `A directory "${name}" already exists in "${baseDir}"`;
          }

          return true;
        },
      },
      {
        type: "select",
        name: "template",
        message: "What template do you want to use?",
        choices: [
          { title: "react + javascript", value: "@creapp/template-react-js" },
          { title: "react + typescript", value: "@creapp/template-react-ts" },
        ],
      },
    ],
    {
      onCancel: () => {
        throw new Error("Aborted");
      },
    }
  );
  const appDir = path.join(baseDir, response.projectName);
  await fs.mkdir(appDir);
  log("Downloading template...", false);
  const res = await execAsync(`npm pack ${response.template} --silent`, {
    cwd: appDir,
  });
  const tarball = res.stdout.trim();
  log(" done");
  log("Extracting template...", false);
  await execAsync(`tar -xf ${tarball} --strip-components=1`, { cwd: appDir });
  await fs.remove(path.join(appDir, tarball));
  log(" done");
  log(chalk`{bold Almost there!}`);
  log(
    chalk`Go to your project {dim cd ${path.relative(process.cwd(), appDir)}}`
  );
  log(chalk`Install dependencies {dim npm install}`);
  log(chalk`Start the app {dim npm start}`);
}

run().catch((err) => {
  log(err);
});
