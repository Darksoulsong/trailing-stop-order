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
        binanceWrapper.terminateConnection( binanceWrapper.getSubscription( params.pair ) );
    }
}

/**
 * @param {{ close: number, date: string, appreciation: number, appreciationPercent: string, differenceFromHighestPrice: number, pair: string }} params 
 */
function onTickReportAppreciation ( params ) {
    reporter.report( 'appreciation', params );
}

/**
 * @param {{ pair: string, buyPrice: number, lossTolerance: number }[]} params 
 */
function getPairs ( params ) {
    return params.map( ( item ) => {
        return item.pair;
    });
}

/**
 * @param {{ pair: string, buyPrice: number, lossTolerance: number }[]} params 
 * @returns {{ [pair: string]: { buyPrice: number, lossTolerance: number } }}
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

/**
 * @param {string} interval
 * @param {{ pair: string, buyPrice: number, lossTolerance: number }[]} params 
 */
module.exports = function start ( interval, params ) {
    const pairs = getPairs( params );

    binanceWrapper = new BinanceWrapper();

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );

    let theParams = getParams( params );

    pairs.forEach( ( pair ) => {
        binanceWrapper.placeTrailingStopOrder( pair, interval, theParams );
    });
    
};
