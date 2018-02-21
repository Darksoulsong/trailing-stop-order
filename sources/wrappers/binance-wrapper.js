// const binance = require( 'node-binance-api' );
// const format = require( 'date-fns/format' );
// const config = require( './../../config' ).binance;
// const eventAggregator = require( './../event-aggregator' ).getInstance();
// const logger = require( './../logger' );
// const Wrapper = require( './wrapper' );

import binance from 'node-binance-api';



class BinanceWrapper extends Wrapper {
    /**
     * @param {string[]} pairs 
     * @param {string} interval 
     */
    constructor ( pairs, interval ) {
        super();

        this.pairs = pairs;
        this.tickerFn = binance.websockets.candlesticks;
        this.tickerFnParams = [ pairs, interval ];

        binance.options( config );
    }

    getBalances ( callback ) {
        binance.balance( (error, balances) => {
            if ( error ) {
                throw new Error( error );
            }
            callback( balances[ this.pairs ] );
        });
    }

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

module.exports = BinanceWrapper;
