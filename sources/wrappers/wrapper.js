const format = require( 'date-fns/format' );
const PriceChecker = require( './../price-checker' );
const eventAggregator = require( './../event-aggregator' ).getInstance();

class Wrapper {

    constructor () {
        this.tickerFnParams = [];
        this.tickerFn = null;

        /** @type {string[]} */
        this.pairs = null;

        this.subscriptions = null;
    }

    /**
     * @param {{ [pair: string]: { lossTolerance: number, buyPrice: number } }} paramsByPair 
     */
    placeTrailingStopOrder ( paramsByPair ) {
        const priceCheckers = {};

        this.pairs.forEach( ( pair ) => {
            let trade = { price: paramsByPair[ pair ].buyPrice };
            let lossTolerance = paramsByPair[ pair ].lossTolerance;

            priceCheckers[ pair ] = new PriceChecker( trade, lossTolerance );
        });

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
            const trade = { price: paramsByPair[ symbol ].buyPrice };
            const priceChecker = priceCheckers[ symbol ];

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

        this.tickerFnParams.push( onTick );

        this.subscriptions = this.tickerFn.apply( this.tickerFn, this.tickerFnParams );
    }
}

module.exports = Wrapper;
