import { clearInterval } from 'timers';

const rp = require( 'request-promise' );
const fs = require( 'fs' );

function request ( url ) {
    return new Promise( function ( resolve, reject ) {
        fs.readFile( url, ( err, data ) => {
            if ( err ) {
                reject( err ); 
            }
            resolve( JSON.parse( data ) );
        });
    });
}

function getTrade () {

    return new Promise( function ( resolve, reject ) {

        setTimeout( function () {

            resolve({

                price: 5760.8

            });

        }, 200);

    });
}

async function listHistoricalData () {

    let historicalData = await request( 'btc-historical-data.json' );

    historicalData.sort( (a, b) => {
        return a.date - b.date;
    });


    return historicalData;
}

function ticker () {

    let idx = 0;
    let data;

    return {
        async get () {
            data = data || await listHistoricalData();

            const tick = data[ idx ];

            idx++;

            return tick;
        }
    };
} 

/**
 * @param {{price: number}} trade 
 * @param {number} stopAtPercentage 
 */
function priceChecker ( trade, stopAtPercentage ) {

    var lastPrice = null;   

    return {
        /**
         * @param {number} tick 
         */
        getProfitPercent ( tick ) {
            if ( !lastPrice ) { return 0; }

            const value = lastPrice * 100 / trade.price;

            return value.toFixed( 2 ) + '%';
        },

        /**
         * @param { number } close
         */
        shouldSell ( close ) {
            let sell = false;

            // bullish, do nothing
            if ( !lastPrice || close >= trade.price ) { 
                return false; 
            }
            
            // bear signal
            if ( close <= lastPrice ) {
                var diff = 100 - ( close * 100 / lastPrice );
                
                if ( diff >= stopAtPercentage ) {
                    sell = true;
                }
            }

            return sell;
        }, 
        
        /**
         * @param { number } price
         */
        setLastPrice ( price ) {
            lastPrice = price;
        }
    };
}

async function run () {
    const data = await listHistoricalData();
    const tk = ticker();
    const trade = await getTrade();
    const pc = priceChecker( trade, 5 );

    async function get () {
        let tick = await tk.get();

        
        if ( !tick || !(!!tick.close) ) {

            if ( !tick ) {
                clearInterval( timer );
            }
            return; 
        }
        
        // @TODO Implement sell
        if ( pc.shouldSell( tick.close ) ) {
            console.log( `Selling at $${ tick.close }` );
        } else {
            console.log( `Close price: $${ tick.close }, actual profit: $${ pc.getProfitPercent( tick.close ) }` );
        }

        pc.setLastPrice( tick.close );
    }

    const timer = setInterval( get , 1000 );
}

run();
