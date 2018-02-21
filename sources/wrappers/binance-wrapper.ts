import binance from 'node-binance-api';
import config from './../../config';
import EventAggregator from './../event-aggregator';
import Wrapper from './wrapper';

const binanceConfig = config.binance;
const eventAggregator = EventAggregator.getInstance();

export default class BinanceWrapper extends Wrapper {
    constructor ( pairs: string[], interval: string ) {
        super();

        // this.pairs = pairs;
        this.tickerFn = binance.websockets.candlesticks;
        // this.tickerFnParams = [ pairs, interval ];

        binance.options( config );
    }

    // getBalances ( callback: ( ) => void ) {
    //     binance.balance( ( error, balances ) => {
    //         if ( error ) {
    //             throw new Error( error );
    //         }
    //         callback( balances[ this.pairs ] );
    //     });
    // }

    terminateConnection () {

        let endpoints = binance.websockets.subscriptions();

        for ( let endpoint in endpoints ) {
            binance.websockets.terminate( endpoint );            
        }

        if ( Object.keys( endpoints ).length === 0 ) {
            eventAggregator.publish( 'onConnectionTerminated', null );
        }
    }
}
