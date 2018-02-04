// @TODO: Get buy price buy cmd param --done
// @TODO: Get pair by cmd param --done
// @TODO: Get interval by cmd param --done
// @TODO: Create reporter
// - PushBullet --done.
// - Email

// -b, -p, -t, -i
const argv = require( 'minimist' )( process.argv.slice( 2 ) );
const start = require( './main' );

const pair = argv.p;
const lossTolerance = argv.t;
const buyPrice = argv.b;
const interval = argv.i;

if ( buyPrice === undefined || !pair || ! lossTolerance ) {
    console.error( `Either -b (buy price) or -p (pair) or -t (lossTolerance) parameter is undefined` );
    return;
}

// main( 0.051397, 'DASHBTC' );
// main( 0.068496, 'DASHBTC', 1 );
// main( 0.068408, 'DASHBTC', 0.1 );
start( buyPrice, pair, lossTolerance, interval );
