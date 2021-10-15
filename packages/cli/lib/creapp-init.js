const path = require("path");
const { execSync } = require("child_process");
const prompts = require("prompts");
const validatePackageName = require("validate-npm-package-name");
const fs = require("fs-extra");

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
  const tarball = execSync(`npm pack ${response.template} --silent`, {
    cwd: appDir,
  })
    .toString("utf-8")
    .trim();
  execSync(`tar -xf ${tarball} --strip-components=1`, { cwd: appDir }).toString(
    "utf-8"
  );
  await fs.remove(path.join(appDir, tarball));
}

run().catch((err) => {
  console.log(err);
});
