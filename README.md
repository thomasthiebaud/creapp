# CREAPP

Minimalist and flexible tool to set up modern web apps. Inspired by [Create React App](https://create-react-app.dev/)

## Philosophy

- Use default configuration as much as possible
- One dependency
- Easy to extends

## How to create an App?

```
npx @creapp/cli init
```

## How to extend the configuration?

`@creapp/config-react` just exports a normal webpack configuration. You can import it and tweak it at will

```js
const getConfig = require("@creapp/config-react");
const config = getConfig(/* You can force NODE_ENV here */);

// Do something with the defaultConfig here
config.xxx = abc;
// For example to have less details when running start/build
config.stats = "minimal";

module.exports = config;
```

The webpack configuration is detailed on [the docs](https://webpack.js.org/configuration/)

## How to change the build/start scripts?

`creapp build` and `creapp start` are tiny CLI helpers that use `webpack` and `webpack-dev-server` under the hood.
You can replace them by anything that understand a webpack configuration.

**IMPORTANT** You need to set `process.env.NODE_ENV` to `production` before running a production build
