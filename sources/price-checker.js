"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PriceChecker = (function () {
    function PriceChecker(_trade, _stopAtPercentage) {
        this._trade = _trade;
        this._stopAtPercentage = _stopAtPercentage;
        this.pricesHistory = new Set();
        this.lastPrice = null;
    }
    PriceChecker.prototype.getAppreciationPercent = function (tick) {
        if (!this.lastPrice) {
            return 0;
        }
        var value = this._calculateAppreciation(tick);
        return value.toFixed(2) + '%';
    };
    PriceChecker.prototype.getAppreciation = function () {
        // let appr = this._calculateAppreciation( this.lastPrice );
        // appr = appr.toFixed( 8 );
        // return  appr;
        return (this.lastPrice - this._trade.price).toFixed(8);
    };
    PriceChecker.prototype.calculateDifference = function (close, highestPrice) {
        highestPrice = highestPrice || Math.max.apply(Math, Array.from(this.pricesHistory));
        return 100 - (close * 100 / highestPrice);
    };
    /**
     * Checks if an asset can be sold, by identifying a bear signal
     * Conditions for selling:
     * - The close value must be higher (and never lower) than the trade price, in order to prevent losses
     * - The percent difference among the close price and the highest price must be higher then the tolerance percentage (stopAtPercentage)
     */
    PriceChecker.prototype.shouldSell = function (close) {
        var goShort = false;
        if (!this.lastPrice || close <= this._trade.price) {
            return goShort;
        }
        var highestPrice = Math.max.apply(Math, Array.from(this.pricesHistory));
        // bear signal
        if (close < highestPrice) {
            var diff = this.calculateDifference(close, highestPrice);
            if (diff >= this._stopAtPercentage) {
                goShort = true;
            }
        }
        return goShort;
    };
    PriceChecker.prototype.setLastPrice = function (price) {
        this.lastPrice = price;
        if (!this.pricesHistory.has(price)) {
            this.pricesHistory.add(price);
        }
    };
    PriceChecker.prototype._calculateAppreciation = function (value) {
        return ((value - this._trade.price) / this._trade.price) * 100;
    };
    return PriceChecker;
}());
exports.default = PriceChecker;
//# sourceMappingURL=price-checker.js.map