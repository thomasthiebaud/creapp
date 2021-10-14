const path = require("path");
const prompts = require("prompts");
const validatePackageName = require("validate-npm-package-name");
const fse = require("fs-extra");

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
          if (fse.existsSync(path.join(baseDir, name))) {
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
          { title: "react + javascript", value: "react-js" },
          { title: "react + typescript", value: "react-ts" },
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
  const srcDir = path.resolve("./template", response.template);

  fse.mkdirSync(appDir);
  fse.copySync(srcDir, appDir);
}

run().catch((err) => {
  console.log(err.message);
});
