"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var binance = require("node-binance-api");
var config_1 = require("./../../config");
var event_aggregator_1 = require("./../event-aggregator");
var wrapper_1 = require("./wrapper");
var binanceConfig = config_1.default.binance;
var eventAggregator = event_aggregator_1.default.getInstance();
var BinanceWrapper = (function (_super) {
    __extends(BinanceWrapper, _super);
    function BinanceWrapper() {
        var _this = _super.call(this) || this;
        _this.tickerFn = binance.websockets.candlesticks;
        binance.options(binanceConfig);
        return _this;
    }
    BinanceWrapper.prototype.getSubscription = function (pair) {
        return this.subscriptions.get(pair);
    };
    // getBalances ( callback: ( ) => void ) {
    //     binance.balance( ( error, balances ) => {
    //         if ( error ) {
    //             throw new Error( error );
    //         }
    //         callback( balances[ this.pairs ] );
    //     });
    // }
    BinanceWrapper.prototype.terminateConnection = function (subscription) {
        var endpoints = binance.websockets.subscriptions();
        for (var endpoint in endpoints) {
            if (subscription === endpoint) {
                binance.websockets.terminate(subscription);
            }
        }
        if (!endpoints || Object.keys(endpoints).length === 0) {
            eventAggregator.publish('onConnectionTerminated', null);
        }
    };
    return BinanceWrapper;
}(wrapper_1.default));
exports.default = BinanceWrapper;
//# sourceMappingURL=binance-wrapper.js.map