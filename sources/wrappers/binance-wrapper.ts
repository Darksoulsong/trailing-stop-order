import * as binance from 'node-binance-api';
import * as format from 'date-fns/format';
import config from './../../config';
import EventAggregator from './../event-aggregator';
import Wrapper from './wrapper';
import utils from './../utils';

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

        const balances = await doGetBalances();
        const symbol = utils.getSymbol( pair, balances );
        const balance = balances[ symbol ];

        balance.available = +balance.available;
        balance.onOrder = +balance.onOrder;

        return new Promise< App.wrappers.TBinanceBalance >( ( resolve ) => {
            resolve( balance );
        });
    }

    getData ( candlesticks ) {

        let {
            // e: eventType, 
            E: eventTime, 
            s: combination, 
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
        
        close = +close;

        return {
            close,
            date,
            combination
        };
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
