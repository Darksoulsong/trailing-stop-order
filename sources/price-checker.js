class PriceChecker {

    /**
     * @param {{price: number}} trade 
     * @param {number} stopAtPercentage 
     */
    constructor ( trade, stopAtPercentage ) {
        /** @type { Set<number> } */
        this.pricesHistory = new Set();

        /** @type { number } */
        this.lastPrice = null;

        /** @type { { price: number } } */
        this.trade = trade;

        /** @type { number } */
        this.stopAtPercentage = stopAtPercentage;
    }

    /**
     * @param {string} tick 
     */
    getAppreciationPercent ( tick ) {
        if ( !this.lastPrice ) { return 0; }
        
        // let value = (tick * 100 / this.trade.price);
        // let subtractValue = value >= 100 ? 100 : (function () { return +value.toString().split( '.' )[ 0 ]; })();

        // value = value - subtractValue;
        let value = this._calculateAppreciation( tick );
        return value.toFixed( 2 ) + '%';
    }

    /**
     * @param {number} value 
     */
    _calculateAppreciation ( value ) {
        /**
         * 
         */
        return ((value - this.trade.price) / this.trade.price) * 100;
    }

    /**
     * @returns {string}
     */
    getAppreciation () {
        let appr = this._calculateAppreciation( this.lastPrice );
        appr = appr.toFixed( 8 );
        return  appr;
    }

    /**
     * Checks if an asset can be sold, by identifying a bear signal
     * Conditions for selling:
     * - The close value must be higher (and never lower) than the trade price, in order to prevent losses
     * - The percent difference among the close price and the highest price must be higher then the tolerance percentage (stopAtPercentage)
     * @param {number} close
     * @returns {boolean}
     */
    shouldSell ( close ) {
        let goShort = false;

        if ( !this.lastPrice || close <= this.trade.price ) { 
            return goShort; 
        }

        const highestPrice = Math.max.apply( Math, Array.from( this.pricesHistory ) );
        
        // bear signal
        if ( close < highestPrice) {
            let diff = 100 - ( close * 100 / highestPrice );

            if ( diff >= this.stopAtPercentage ) {
                goShort = true;
            }
        }

        return goShort;
    }

    /**
     * @param {number} price
     */
    setLastPrice ( price ) {
        this.lastPrice = price;
        
        if ( !this.pricesHistory.has( price ) ) {
            this.pricesHistory.add( price );
        }
    }
}

module.exports = PriceChecker;
