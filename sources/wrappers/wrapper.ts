import format from 'date-fns/format';
import PriceChecker from './../price-checker';
import EventAggregator from './../event-aggregator';

const eventAggregator = EventAggregator.getInstance();

export default class Wrapper implements App.wrappers.IWrapper {
    tickerFn;
    subscription: string;

    constructor () {
        this.tickerFn = null;
        this.subscription = null;
    }

    placeTrailingStopOrder ( pair: string, interval: number, paramsByPair: App.wrappers.TParamsByPair ) {
        const priceCheckers = {};

        let trade = { price: paramsByPair[ pair ].buyPrice };
        let lossTolerance = paramsByPair[ pair ].lossTolerance;

        priceCheckers[ pair ] = new PriceChecker( trade, lossTolerance );

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

        this.subscription = this.tickerFn( [ pair ], interval, onTick );
    }
}
