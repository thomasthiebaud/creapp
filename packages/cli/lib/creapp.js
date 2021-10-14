#!/usr/bin/env node

const program = require("commander");
const pck = require("../package.json");

program
  .version(pck.version)
  .command("build", "Build an optimized version of your app")
  .command("init", "Create a new crapp project")
  .command("start", "Start your app locally in development")
  .parse(process.argv);
