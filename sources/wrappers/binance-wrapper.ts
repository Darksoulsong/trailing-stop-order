import * as binance from 'node-binance-api';
import config from './../../config';
import EventAggregator from './../event-aggregator';
import Wrapper from './wrapper';

const binanceConfig = config.binance;
const eventAggregator = EventAggregator.getInstance();

export default class BinanceWrapper extends Wrapper implements App.wrappers.IBinanceWrapper {
    constructor () {
        super();

        this.tickerFn = binance.websockets.candlesticks;
        binance.options( binanceConfig );
    }

    getSubscription ( pair ) {
        return this.subscriptions.get( pair );
    }

    async sell ( pair: string, quantity: number, price: number ) {

        function doSell () {
            return new Promise( ( resolve, reject ) => {
                binance.sell( pair, quantity, price, { type:'LIMIT' }, 
                    ( error, response ) => {
                        if ( error ) { reject( error ) }

                        resolve( response );
                    }
                );
            });
        }

        return await doSell();
    }

    async getBalances ( pair: string ): Promise< App.wrappers.TBinanceBalance > {
        function get () {
            return new Promise< App.wrappers.TBinanceBalanceByPair >( ( resolve, reject ) => {
                binance.balance( ( error, balances ) => {
                    if ( error ) { reject( error ); }
                    resolve( balances );
                });
            });
        }

        async function doGetBalances () {
            return await get();
        }

        const balance = await doGetBalances();
        const element = balance[ pair ];
        element.available = +element.available;
        element.onOrder = +element.onOrder;

        return new Promise< App.wrappers.TBinanceBalance >( ( resolve ) => {
            resolve( element );
        });
    }

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
