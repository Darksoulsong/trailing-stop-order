"use strict";
// @TODO: Create param checking:
// - "-p" format (PAIR=buyPrice)
// @TODO: Get the wrapper based on the params passed
// @TODO: Create reporter
// - PushBullet --done.
// - Email
Object.defineProperty(exports, "__esModule", { value: true });
// -b, -p, -t, -i
var minimist = require("minimist");
var main_1 = require("./main");
var event_aggregator_1 = require("./sources/event-aggregator");
var utils_1 = require("./sources/utils");
var eventAggregator = event_aggregator_1.default.getInstance();
var argv = minimist(process.argv.slice(2));
utils_1.default.checkArgs(argv._);
eventAggregator.subscribe('onConnectionTerminated', function () {
    process.exit();
});
var args = utils_1.default.getArgs(argv._);
var Wrapper = utils_1.default.getWrapper('binance');
main_1.default(args.interval, args.params, Wrapper);
//# sourceMappingURL=index.js.map