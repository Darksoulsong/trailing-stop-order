class PriceChecker {

    /**
     * @param {{price: number}} trade 
     * @param {number} stopAtPercentage 
     */
    constructor ( trade, stopAtPercentage ) {
        /** @type { number[] } */
        this.pricesHistory = [];

        /** @type { number } */
        this.lastPrice = null;

        /** @type { number[] } */
        this.trade = trade;

        /** @type { number } */
        this.stopAtPercentage = stopAtPercentage;
    }

    /**
     * @param {string} tick 
     */
    getEvaluationPercent ( tick ) {
        if ( !this.lastPrice ) { return 0; }

        const value = (tick * 100 / this.trade.price) - 100;
        return value.toFixed( 2 ) + '%';
    }

    /**
     * @returns {string}
     */
    getEvaluation () {
        return  (this.lastPrice - this.trade.price).toFixed( 2 );
    }

    /**
     * @param { number } close
     * @returns {boolean}
     */
    shouldSell ( close ) {
        let goShort = false;

        if ( !this.lastPrice ) { 
            return false; 
        }

        const highestPrice = Math.max.apply( Math, this.pricesHistory );
        
        // bear signal
        if ( close < highestPrice ) {
            let diff = 100 - ( close * 100 / highestPrice );

            if ( diff >= this.stopAtPercentage ) {
                goShort = true;
            }
        }

        return goShort;
    }

    /**
     * @param { number } price
     */
    setLastPrice ( price ) {
        this.lastPrice = price;
        this.pricesHistory.push( price );
    }
}

module.exports = PriceChecker;
