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

    sell( pair: string, quantity: number, price: number ): Promise<{}> {
        throw 'Not Implemented!';
    }

    terminateConnection ( subscription: string ) {
        throw 'Not Implemented!';
    }

    getSubscription ( pair: string ) {
        throw 'Not Implemented!';
    }

    getBalances( pair: string ): any {
        throw 'Not Implemented!';
    }

    getData( data ): { close: number, date: number, combination: string } {
        throw 'Not Implemented!';
    };

    placeTrailingStopOrder ( pair: string, interval: string, paramsByPair: App.wrappers.TParamsByPair ) {
        const priceCheckers = {};

        let trade = { price: paramsByPair[ pair ].buyPrice };
        let lossTolerance = paramsByPair[ pair ].lossTolerance;

        priceCheckers[ pair ] = new PriceChecker( trade, lossTolerance );

        const onTick = async ( onTickData ) => {
            const data = this.getData( onTickData );
            
            const priceChecker = priceCheckers[ data.combination ];
            const tradePrice = paramsByPair[ data.combination ].buyPrice;
            const appreciation = priceChecker.getAppreciation();
            // const pair = combination;
            const terminateConnection = config[ 'testMode' ] ? false : true;
            const appreciationPercent = priceChecker.getAppreciationPercent( data.close );
            const differenceFromHighestPrice = -priceChecker.calculateDifference( data.close ).toFixed( 2 );
            const date = data.date;
    
            priceChecker.setLastPrice( data.close );
    
            if ( priceChecker.shouldSell( data.close ) ) {
    
                const balance = await this.getBalances( pair );
    
                // const sellResponse = this.sell( pair, balance.available, close );
    
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
        }

        this.subscriptions.set( pair, 
            this.tickerFn.apply( this.tickerFn, [ pair, interval, onTick ] )
        );
    }
}
