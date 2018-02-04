const format = require( 'date-fns/format' );
const config = require( './config' ).binance;
const Trader = require( './sources/trader' );
const eventAggregator = require( './sources/event-aggregator' ).getInstance();
const reporter = require( './sources/reporter' ).getInstance();
const binance = require( 'node-binance-api' );
const PriceChecker = require( './sources/price-checker' );

class BinanceWrapper {
    /**
     * @param {string} pair 
     * @param {string} interval 
     */
    constructor ( pair, interval ) {
        this.currency = pair;
        this.tickerFn = binance.websockets.candlesticks;
        this.tickerFnParams = [ [ pair ], interval ];

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
        const priceChecker = new PriceChecker( trade, lossLimitPercent );

        function onTick ( candlesticks ) {
            
            let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
            let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;
            let date = format( new Date( eventTime ), "D/MM/YYYY - HH:mm:ss" );
            
            close = +close;

            const appreciation = priceChecker.getAppreciation();
            const appreciationPercent = priceChecker.getAppreciationPercent( close );

            priceChecker.setLastPrice( close );

            if ( priceChecker.shouldSell( close ) ) {
                const terminateConnection = true;
                eventAggregator.publish( 'onTickReportSell', { close, date, appreciation, appreciationPercent, terminateConnection } );
            } else {
                eventAggregator.publish( 'onTickReportAppreciation', { close, date, appreciation, appreciationPercent } );
            }
        }

        this.tickerFnParams.push( onTick );

        this.tickerFn.apply( this.tickerFn, this.tickerFnParams );
    }
}

/**
 * @param {number} buyPrice The price the asset was bought
 * @param {string} pair Crypto or FIAT pair, for example, DASHUSD, DASHBTC, ETHUSD and so on
 * @param {number} maximumDepreciationTolerance Maximum depreciation in percent
 * @param {string} interval The interval. Possible values: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
 */
module.exports = function start ( buyPrice, pair, maximumDepreciationTolerance, interval='1m' ) {
    const trade = { price: buyPrice };
    const binanceWrapper = new BinanceWrapper( pair, interval );
    
    /**
     * @param {{ close: number, date: string, appreciation: number, appreciationPercent: string, terminateConnection: boolean }} params 
     */
    function onTickReportSell ( params ) {
        params.tradePrice = trade.price;

        reporter.report( 'sell', params );

        if ( params.terminateConnection ) {
            let endpoints = binance.websockets.subscriptions();

            for ( let endpoint in endpoints ) {
                console.log( endpoint );
                binance.websockets.terminate( endpoint );
            }
        }
    }

    /**
     * @param {{ close: number, date: string, appreciation: number, appreciationPercent: string }} params 
     */
    function onTickReportAppreciation ( params ) {
        reporter.report( 'appreciation', params );
    }

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );

    binanceWrapper.placeTrailingStopOrder( maximumDepreciationTolerance, trade );
};
