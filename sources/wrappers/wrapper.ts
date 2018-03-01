import * as format from 'date-fns/format';
import PriceChecker from './../price-checker';
import EventAggregator from './../event-aggregator';
import config from './../../config';

const eventAggregator = EventAggregator.getInstance();

export default class Wrapper implements App.wrappers.IWrapper {
    tickerFn;
    subscriptions: Map<string, string>;

    constructor () {
        this.tickerFn = null;
        this.subscriptions = new Map();        
    }

    terminateConnection ( subscription: string ) {
        throw 'Not Implemented!';
    }

    getSubscription ( pair: string ) {
        throw 'Not Implemented!';
    }

    placeTrailingStopOrder ( pair: string, interval: string, paramsByPair: App.wrappers.TParamsByPair ) {
        const priceCheckers = {};

        let trade = { price: paramsByPair[ pair ].buyPrice };
        let lossTolerance = paramsByPair[ pair ].lossTolerance;

        priceCheckers[ pair ] = new PriceChecker( trade, lossTolerance );

        const onTick = ( candlesticks ) => {

            let { 
                // e: eventType, 
                E: eventTime, 
                s: symbol, 
                k: ticks 
            } = candlesticks;
            let date = format( new Date( eventTime ), "D/MM/YYYY - HH:mm:ss" );
            let { 
                // o: open, 
                // h: high, 
                // l: low, 
                c: close, 
                // v: volume, 
                // n: trades, 
                // i: interval, 
                // x: isFinal, 
                // q: quoteVolume, 
                // V: buyVolume, 
                // Q: quoteBuyVolume 
            } = ticks;
            const tradePrice = paramsByPair[ symbol ].buyPrice;
            const priceChecker = priceCheckers[ symbol ];

            close = +close;

            const appreciation = priceChecker.getAppreciation();
            const appreciationPercent = priceChecker.getAppreciationPercent( close );
            const pair = symbol;
            const differenceFromHighestPrice = -priceChecker.calculateDifference( close ).toFixed( 2 );
            const terminateConnection = config.testMode ? false : true;

            priceChecker.setLastPrice( close );

            if ( priceChecker.shouldSell( close ) ) {

                eventAggregator.publish( 'onTickReportSell', { 
                    close, 
                    date, 
                    appreciation, 
                    appreciationPercent, 
                    terminateConnection,
                    tradePrice,
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
