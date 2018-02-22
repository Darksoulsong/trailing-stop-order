import EventAgregator from './sources/event-aggregator';
import Reporter from './sources/reporter';
import BinanceWrapper from './sources/wrappers/binance-wrapper';

const eventAggregator = EventAgregator.getInstance();
const reporter = Reporter.getInstance();

let binanceWrapper: BinanceWrapper;

async function onTickReportSell ( params: App.sources.TTickerSellDataReport ) {
    await reporter.report( 'sell', params );

    if ( params.terminateConnection ) {
        binanceWrapper.terminateConnection( binanceWrapper.getSubscription( params.pair ) );
    }
}

function onTickReportAppreciation ( params ) {
    reporter.report( 'appreciation', params );
}

function getPairs ( params: App.sources.TStartParams[] ): string[] {
    return params.map( ( item ) => {
        return item.pair;
    });
}

function getParams ( params: App.sources.TStartParams[] ): App.wrappers.TParamsByPair {
    let obj = {};

    params.forEach( ( item ) => {
        obj[ item.pair ] = {
            buyPrice: item.buyPrice,
            lossTolerance: item.lossTolerance
        };
    });

    return obj;
}

export default function start ( interval: string, params: App.sources.TStartParams[] ) {
    const pairs = getPairs( params );
    const theParams = getParams( params );

    binanceWrapper = new BinanceWrapper();

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );
    
    pairs.forEach( ( pair ) => {
        binanceWrapper.placeTrailingStopOrder( pair, interval, theParams );
    });
};
