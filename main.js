const eventAggregator = require( './sources/event-aggregator' ).getInstance();
const reporter = require( './sources/reporter' ).getInstance();
const BinanceWrapper = require( './sources/wrappers/binance-wrapper' );

/** @type { BinanceWrapper } */
let binanceWrapper;

/**
 * @param {{ close: number, date: string, appreciation: number, appreciationPercent: string, terminateConnection: boolean, trade: { price: number }, pair: string, differenceFromHighestPrice: number  }} params 
 */
async function onTickReportSell ( params ) {
    params.tradePrice = params.trade.price;

    await reporter.report( 'sell', params );

    if ( params.terminateConnection ) {
        binanceWrapper.terminateConnection();
    }
}

/**
 * @param {{ close: number, date: string, appreciation: number, appreciationPercent: string, differenceFromHighestPrice: number, pair: string }} params 
 */
function onTickReportAppreciation ( params ) {
    reporter.report( 'appreciation', params );
}

/**
 * @param { {pair: string, buyPrice: number, lossTolerance: number}[] } params 
 */
function getPairs ( params ) {
    return params.map( ( item ) => {
        return item.pair;
    });
}

/**
 * @param { {pair: string, buyPrice: number, lossTolerance: number}[] } params 
 * @returns { {pair: string}[] }
 */
function getParams ( params ) {
    let obj = {};

    params.forEach( ( item ) => {
        obj[ item.pair ] = {
            buyPrice: item.buyPrice,
            lossTolerance: item.lossTolerance
        };
    });

    return obj;
}

// /**
//  * @param {string} pairs Crypto or FIAT pair, for example, DASHUSD, DASHBTC, ETHUSD and so on
//  * @param {number} maximumDepreciationTolerance Maximum depreciation in percent
//  * @param {string} interval The candle interval. Possible values: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
//  */
// module.exports = function start (pairs, maximumDepreciationTolerance, interval='1m' ) {

/**
 * @param {string} interval
 * @param { {pair: string, buyPrice: number, lossTolerance: number}[] } params 
 */
module.exports = function start ( interval, params ) {
    // @TODO: handle the params
    // maximumDepreciationTolerance = params.lossTolerance;
    
    binanceWrapper = new BinanceWrapper( getPairs( params ), interval );

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );

    binanceWrapper.placeTrailingStopOrder( getParams( params ) );
};
