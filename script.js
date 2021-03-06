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
            resolve({ price: 5760.8 });
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

    const pricesHistory = [];
    let lastPrice = null;       

    return {
        /**
         * @param {string} tick 
         */
        getEvaluationPercent ( tick ) {
            if ( !lastPrice ) { return 0; }

            const value = (tick * 100 / trade.price) - 100;
            const perc = value.toFixed( 2 ) + '%';

            return perc;
        },

        /**
         * @returns {string}
         */
        getEvaluation () {
            return  (lastPrice - trade.price).toFixed();
        },

        /**
         * @param { number } close
         * @returns {boolean}
         */
        shouldSell ( close ) {
            let sell = false;

            // bullish, do nothing
            if ( !lastPrice /*|| close >= trade.price*/ ) { 
                return false; 
            }

            const highestPrice = Math.max.apply( Math, pricesHistory );
            
            // bear signal
            if ( close < highestPrice ) {
                var diff = 100 - ( close * 100 / highestPrice );
                
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
            pricesHistory.push( price );
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
        
        if ( !tick || !( !!tick.close ) ) {
            if ( !tick ) {
                clearInterval( timer );
            }
            return; 
        }
        
        // @TODO Implement sell
        if ( pc.shouldSell( tick.close ) ) {
            const evaluationPercent = pc.getEvaluationPercent( tick.close );

            console.log(
`Script terminated. Details:
- Acquired asset at $${ trade.price }
- Sold asset at $${ tick.close }
- Valuation of $${ pc.getEvaluation() }, a total of $${ evaluationPercent }.`
            );
            clearInterval( timer );
        } else {
            console.log( `Close price: $${ tick.close }, actual profit: $${ pc.getEvaluationPercent( tick.close ) }` );
        }

        pc.setLastPrice( tick.close );
    }

    const timer = setInterval( get , 1000 );
}

run();

// @TODO: Move functions into separated modules
// @TODO: Create reporter
// @TODO: Implement some API
// @TODO: Implement selling for testing
