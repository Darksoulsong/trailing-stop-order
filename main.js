const format = require( 'date-fns/format' );
const eventAggregator = require( './sources/event-aggregator' ).getInstance();
const reporter = require( './sources/reporter' ).getInstance();
const BinanceWrapper = require( './sources/wrappers/binance-wrapper' );


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
        params.pair = pair;

        reporter.report( 'sell', params );

        if ( params.terminateConnection ) {
            binanceWrapper.terminateConnection();
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
