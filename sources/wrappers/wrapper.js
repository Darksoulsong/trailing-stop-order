const format = require( 'date-fns/format' );
const PriceChecker = require( './../price-checker' );
const eventAggregator = require( './../event-aggregator' ).getInstance();

class Wrapper {

    constructor () {
        this.tickerFn = null;

        this.subscriptions = new Map();        
    }

    getSubscription ( pair ) {
        return this.subscriptions.get( pair );
    }

    /**
     * @param { string } pair
     * @param {{ [pair: string]: { lossTolerance: number, buyPrice: number } }} paramsByPair 
     */
    placeTrailingStopOrder ( pair, interval, paramsByPair ) {

        const paramByPair = paramsByPair[ pair ];
        const trade = { price: paramByPair.buyPrice };
        const lossTolerance = paramByPair.lossTolerance;
        const priceChecker = new PriceChecker( trade, lossTolerance );

        const onTick = ( candlesticks ) => {

            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let date = format( new Date( eventTime ), "D/MM/YYYY - HH:mm:ss" );
            let { 
                o: open, 
                h: high, 
                l: low, 
                c: close, 
                v: volume, 
                n: trades, 
                i: interval, 
                x: isFinal, 
                q: quoteVolume, 
                V: buyVolume, 
                Q: quoteBuyVolume 
            } = ticks;

            close = +close;

            const appreciation = priceChecker.getAppreciation();
            const appreciationPercent = priceChecker.getAppreciationPercent( close );
            const pair = symbol;
            const differenceFromHighestPrice = -priceChecker.calculateDifference( close ).toFixed( 2 );

            priceChecker.setLastPrice( close );

            if ( priceChecker.shouldSell( close ) ) {

                eventAggregator.publish( 'onTickReportSell', { 
                    close, 
                    date, 
                    appreciation, 
                    appreciationPercent, 
                    terminateConnection: true,
                    trade,
                    pair,
                    differenceFromHighestPrice
                });

            } else {

                eventAggregator.publish( 'onTickReportAppreciation', { 
                    close, 
                    date, 
                    appreciation, 
                    appreciationPercent,
                    differenceFromHighestPrice,
                    pair
                });

            }
        };

        this.subscriptions.set( pair, this.tickerFn.apply( this.tickerFn, [ pair, interval, onTick ] ) );
    }
}

module.exports = Wrapper;
