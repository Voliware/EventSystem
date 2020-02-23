const Build = require('@voliware/node-build').Build;

new Build({
    input: "./lib/eventSystem.js",
    output: "./dist/eventSystem.min.js",
    minify: true
}).run();