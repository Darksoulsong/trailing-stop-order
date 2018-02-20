// @TODO: Create param checking:
// - "-p" format (PAIR=buyPrice)
// @TODO: Create option to place multiple TSOs
// - pass multiple pairs --done
// - pass multiple buyPrices --done
// @TODO: Create reporter
// - PushBullet --done.
// - Email
// @BUG: script is terminating despite multiple pair monitoring.

// -b, -p, -t, -i
const argv = require( 'minimist' )( process.argv.slice( 2 ) );
const start = require( './main' );
const eventAggregator = require( './sources/event-aggregator' ).getInstance();

/**
 * @param {Array} args 
 */
function checkArgs ( args ) {
    
    args.forEach( ( /** @type {number | string} */ arg ) => {
        const supplied = [];

        arg.split( '-' ).forEach( ( element ) => {
            var a = element.split( '=' );
            supplied.push( a[ 0 ] );            
        });

        if ( supplied.length === 1 && supplied[ 0 ] === 'i' ) { return; }

        if ( 
            supplied.indexOf( 'p' ) === -1
            || supplied.indexOf( 'b' ) === -1
            || supplied.indexOf( 'l' ) === -1
        ) {
            throw new Error( 'Required params missing. Check "p" (pair), "b" (buyPrice), "l" (loss tolerance)' );
        }
    });

}

/**
 * @param {Array} args 
 * @returns { {pair: string, buyPrice: number, interval: string, lossTolerance: string}[] }
 */
function getArgs ( args ) {
    // [ 
    //     "i=30m",
    //     "p=DASHBTC-b=0.068408-i=15m-l=0.2",
    //     "p=LTCBTC-b=0.008408-i=30m-l=0.2"
    // ]

    let params = [];
    let interval = null;

    args.forEach( ( /** @type {number | string} */ arg ) => {
        const obj = {};

        arg.split( '-' ).forEach( ( element ) => {
            element.split( '=' ).forEach( ( a, index, arr ) => {
                if ( index === 1 ) { return; }

                switch ( a ) {
                    case 'p':
                        obj.pair = arr[ 1 ];
                        break;
                    case 'b':
                        obj.buyPrice = +arr[ 1 ];
                        break;
                    case 'l':
                        obj.lossTolerance = +arr[ 1 ];
                        break;            
                    default:
                        obj.interval = arr[ 1 ] || '15m';
                        break;
                }
            });
        });

        if ( 'interval' in obj ) {
            interval = obj.interval;
        } else {
            params.push( obj );
        }

    });

    return {
        interval,
        params
    };
}

checkArgs( argv._ );

eventAggregator.subscribe( 'onConnectionTerminated', () => {
    process.exit();
});

const args = getArgs( argv._  );

// start( buyPrice, pair, lossTolerance, interval );
start( args.interval, args.params );
