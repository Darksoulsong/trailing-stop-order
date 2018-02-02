const format = require( 'date-fns/format' );
const config = require( './sources/config' ).binance;
const Trader = require( './sources/trader' );
const eventAggregator = require( './sources/event-aggregator' ).getInstance();
const reporter = require( './sources/reporter' ).getInstance();
const binance = require( 'node-binance-api' );
const PriceChecker = require( './sources/price-checker' );

class BinanceWrapper {
    /**
     * @param {string} pair 
     */
    constructor ( pair ) {
        this.currency = pair;
        this.tickerFn = binance.websockets.candlesticks;
        this.tickerFnParams = [ [pair], '1m' ];

        binance.options( config );
    }

    getBalances ( callback ) {
        binance.balance( (error, balances) => {
            if ( error ) {
                throw new Error( error );
            }
            callback( balances[ this.currency ] );
        });
    }

    placeTrailingStopOrder ( lossLimitPercent, trade ) {
        const priceChecker = new PriceChecker( trade, 5 );

        function onTick ( candlesticks ) {
            
            let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
            let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
            let date = format( new Date( eventTime ), "D/MM/YYYY - HH:mm:ss" );

            close = +close;

            if ( priceChecker.shouldSell( close ) ) {
                const appreciationPercent = priceChecker.getAppreciationPercent( close );
                const appreciation = priceChecker.getAppreciation();

                eventAggregator.publish( 'onTickReportSell', { close, date, appreciation, appreciationPercent } );
            } else {
                eventAggregator.publish( 'onTickReportAppreciation', { close, date, appreciation, appreciationPercent } );
            }

            priceChecker.setLastPrice( close );
        }

        this.tickerFnParams.push( onTick );

        this.tickerFn.apply( this.tickerFn, this.tickerFnParams );
    }
}

/**
 * @param {number} buyPrice
 * @param {string} pair
 */
module.exports = function run ( buyPrice, pair ) {
    const trade = { price: buyPrice };
    const binanceWrapper = new BinanceWrapper( pair );
    
    /**
     * @param {{close: number, date: string, appreciation: number, appreciationPercent: string }} params 
     */
    function onTickReportSell ( params ) {
        reporter.report( 'sell', params );
    }

    /**
     * @param {{close: number, date: string, appreciation: number, appreciationPercent: string }} params 
     */
    function onTickReportAppreciation ( params ) {
        reporter.report( 'appreciation', params );
    }

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );

    binanceWrapper.placeTrailingStopOrder( 5, trade );
};
