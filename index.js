// @TODO: Integrate forever and make it optional
// @TODO: Create param checking
// @TODO: Create option to place multiple TSOs
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

if ( buyPrice === undefined || !pair || !lossTolerance ) {
    throw new Error( `Either -b (buy price) or -p (pair) or -t (lossTolerance) parameter is undefined` );
    return;
}

start( buyPrice, pair, lossTolerance, interval );
