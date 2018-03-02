export default class PriceChecker {

    pricesHistory: Set<number>;
    lastPrice: number;

    constructor ( private _trade: App.sources.TTrade, private _stopAtPercentage: number ) {        
        this.pricesHistory = new Set();
        this.lastPrice = null;
    }

    getAppreciationPercent ( tick: number ) {
        if ( !this.lastPrice ) { return 0; }

        let value = this._calculateAppreciation( tick );
        return value.toFixed( 2 ) + '%';
    }

    getAppreciation (): string {
        // let appr = this._calculateAppreciation( this.lastPrice );
        // appr = appr.toFixed( 8 );
        // return  appr;
        return (this.lastPrice - this._trade.price).toFixed( 8 );
    }

    calculateDifference ( close: number, highestPrice?: number ) {
        highestPrice = highestPrice || Math.max.apply( Math, Array.from( this.pricesHistory ) );
        return 100 - ( close * 100 / highestPrice );
    }

    /**
     * Checks if an asset can be sold, by identifying a bear signal
     * Conditions for selling:
     * - The close value must be higher (and never lower) than the trade price, in order to prevent losses
     * - The percent difference among the close price and the highest price must be higher then the tolerance percentage (stopAtPercentage)
     */
    shouldSell ( close: number ): boolean {
        let goShort = false;

        if ( !this.lastPrice || close <= this._trade.price ) { 
            return goShort; 
        }

        const highestPrice = Math.max.apply( Math, Array.from( this.pricesHistory ) );
        
        // bear signal
        if ( close < highestPrice) {
            let diff = this.calculateDifference( close, highestPrice );

            if ( diff >= this._stopAtPercentage ) {
                goShort = true;
            }
        }

        return goShort;
    }

    setLastPrice ( price: number ) {
        this.lastPrice = price;
        
        if ( !this.pricesHistory.has( price ) ) {
            this.pricesHistory.add( price );
        }
    }

    private _calculateAppreciation ( value: number ) {
        return ((value - this._trade.price) / this._trade.price) * 100;
    }
}
