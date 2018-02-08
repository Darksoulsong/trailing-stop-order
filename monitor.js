const argv = require( 'minimist' )( process.argv.slice( 2 ) );
const forever = require( 'forever-monitor' );
const eventAggregator = require( './sources/event-aggregator' ).getInstance();

const pair = argv.p;
const lossTolerance = argv.t;
const buyPrice = argv.b;
const interval = argv.i;

const child = new forever.Monitor( 'index.js', {
    max: 1,
    silent: false,
    args: [ `-p ${ pair }`, `-t ${ lossTolerance }`, `-b ${ buyPrice }`, `-i ${ interval }` ]
});

eventAggregator.subscribe( 'onConnectionTerminated', ( endpoint ) => {
    child.stop();
});

child.on( 'exit', function () {
    console.log( 'your-filename.js has exited after 1 restarts' );
});

child.start();