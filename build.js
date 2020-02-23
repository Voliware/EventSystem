const Build = require('@voliware/node-build').Build;
const version = require('./package.json').version;

new Build({
    name: "Event System",
    version: version,
    input: "./lib/eventSystem.js",
    output: "./dist/eventSystem.min.js",
    minify: true
}).run();