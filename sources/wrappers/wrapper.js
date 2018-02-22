"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var format_1 = require("date-fns/format");
var price_checker_1 = require("./../price-checker");
var event_aggregator_1 = require("./../event-aggregator");
var eventAggregator = event_aggregator_1.default.getInstance();
var Wrapper = /** @class */ (function () {
    function Wrapper() {
        this.tickerFn = null;
        this.subscriptions = new Map();
    }
    Wrapper.prototype.terminateConnection = function (subscription) {
        throw 'Not Implemented!';
    };
    Wrapper.prototype.getSubscription = function (pair) {
        throw 'Not Implemented!';
    };
    Wrapper.prototype.placeTrailingStopOrder = function (pair, interval, paramsByPair) {
        var priceCheckers = {};
        var trade = { price: paramsByPair[pair].buyPrice };
        var lossTolerance = paramsByPair[pair].lossTolerance;
        priceCheckers[pair] = new price_checker_1.default(trade, lossTolerance);
        var onTick = function (candlesticks) {
            var eventType = candlesticks.e, eventTime = candlesticks.E, symbol = candlesticks.s, ticks = candlesticks.k;
            var date = format_1.default(new Date(eventTime), "D/MM/YYYY - HH:mm:ss");
            var open = ticks.o, high = ticks.h, low = ticks.l, close = ticks.c, volume = ticks.v, trades = ticks.n, interval = ticks.i, isFinal = ticks.x, quoteVolume = ticks.q, buyVolume = ticks.V, quoteBuyVolume = ticks.Q;
            var tradePrice = paramsByPair[symbol].buyPrice;
            var priceChecker = priceCheckers[symbol];
            close = +close;
            var appreciation = priceChecker.getAppreciation();
            var appreciationPercent = priceChecker.getAppreciationPercent(close);
            var pair = symbol;
            var differenceFromHighestPrice = -priceChecker.calculateDifference(close).toFixed(2);
            priceChecker.setLastPrice(close);
            if (priceChecker.shouldSell(close)) {
                eventAggregator.publish('onTickReportSell', {
                    close: close,
                    date: date,
                    appreciation: appreciation,
                    appreciationPercent: appreciationPercent,
                    terminateConnection: true,
                    tradePrice: tradePrice,
                    pair: pair,
                    differenceFromHighestPrice: differenceFromHighestPrice
                });
            }
            else {
                eventAggregator.publish('onTickReportAppreciation', {
                    close: close,
                    date: date,
                    appreciation: appreciation,
                    appreciationPercent: appreciationPercent,
                    differenceFromHighestPrice: differenceFromHighestPrice,
                    pair: pair
                });
            }
        };
        this.subscriptions.set(pair, this.tickerFn.apply(this.tickerFn, [pair, interval, onTick]));
    };
    return Wrapper;
}());
exports.default = Wrapper;
//# sourceMappingURL=wrapper.js.map