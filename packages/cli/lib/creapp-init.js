const path = require("path");
const { execSync } = require("child_process");
const prompts = require("prompts");
const validatePackageName = require("validate-npm-package-name");
const fse = require("fs-extra");
const https = require("https");
const { PassThrough } = require("stream");
const gunzip = require("gunzip-maybe");
const tar = require("tar-fs");
const mv = require("mv");

async function untarRequest(url, dest) {
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const unzip = gunzip();
    const untar = tar.extract(dest);

    stream.pipe(unzip).pipe(untar);
    https.get(url, (response) => {
      const statusCode = response.statusCode;
      if (statusCode !== 200) {
        return reject(new Error("Download error!"));
      }

      response.pipe(stream);

      stream.on("error", (err) => reject(err));
      stream.on("finish", () => resolve());
    });
  });
}

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
  fse.mkdirSync(appDir);
  const url = execSync(`npm view ${response.template} dist.tarball`).toString(
    "utf-8"
  );
  await untarRequest(url, appDir);
  mv(
    path.join(appDir, "package"),
    appDir,
    { mkdirp: true, clobber: false },
    () => {}
  );
}

run().catch((err) => {
  console.log(err);
});
