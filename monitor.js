"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var minimist = require("minimist");
var forever = require("forever-monitor");
var event_aggregator_1 = require("./sources/event-aggregator");
var utils_1 = require("./sources/utils");
var argv = minimist(process.argv.slice(2));
var eventAggregator = event_aggregator_1.default.getInstance();
utils_1.default.checkArgs(argv._);
var child = new forever.Monitor('index.js', {
    max: 1,
    silent: false,
    args: argv._
});
eventAggregator.subscribe('onConnectionTerminated', function () {
    child.stop();
    process.exitCode = 0;
});
child.on('exit', function () {
    console.log('Script terminated.');
});
child.start();
//# sourceMappingURL=monitor.js.map