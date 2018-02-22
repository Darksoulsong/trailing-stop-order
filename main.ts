import EventAgregator from './sources/event-aggregator';
import Reporter from './sources/reporter';

const eventAggregator = EventAgregator.getInstance();
const reporter = Reporter.getInstance();

let wrapper: App.wrappers.IWrapper;

async function onTickReportSell ( params: App.sources.TTickerSellDataReport ) {
    await reporter.report( 'sell', params );

    if ( params.terminateConnection ) {
        wrapper.terminateConnection( wrapper.getSubscription( params.pair ) );
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

export default function start ( interval: string, params: App.sources.TStartParams[], Wrapper ) {
    const pairs = getPairs( params );
    const theParams = getParams( params );

    wrapper = new Wrapper() as App.wrappers.IWrapper;

    eventAggregator.subscribe( 'onTickReportSell', onTickReportSell );
    eventAggregator.subscribe( 'onTickReportAppreciation', onTickReportAppreciation );
    
    pairs.forEach( ( pair ) => {
        wrapper.placeTrailingStopOrder( pair, interval, theParams );
    });
};
