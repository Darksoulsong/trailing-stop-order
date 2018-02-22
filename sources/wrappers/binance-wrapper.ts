import binance from 'node-binance-api';
import config from './../../config';
import EventAggregator from './../event-aggregator';
import Wrapper from './wrapper';

const binanceConfig = config.binance;
const eventAggregator = EventAggregator.getInstance();

export default class BinanceWrapper extends Wrapper {
    constructor () {
        super();

        this.tickerFn = binance.websockets.candlesticks;
        binance.options( config );
    }

    getSubscription ( pair ) {
        return this.subscriptions.get( pair );
    }

    // getBalances ( callback: ( ) => void ) {
    //     binance.balance( ( error, balances ) => {
    //         if ( error ) {
    //             throw new Error( error );
    //         }
    //         callback( balances[ this.pairs ] );
    //     });
    // }

    terminateConnection ( subscription: string ) {

        let endpoints = binance.websockets.subscriptions();

        for ( let endpoint in endpoints ) {
            if ( subscription === endpoint ) {
                binance.websockets.terminate( subscription );
            }
        }

        if ( !endpoints || Object.keys( endpoints ).length === 0 ) {
            eventAggregator.publish( 'onConnectionTerminated', null );
        }
    }
}
