// @TODO: Create param checking:
// - "-p" format (PAIR=buyPrice)
// @TODO: Get the wrapper based on the params passed
// @TODO: Create option to place multiple TSOs
// - pass multiple pairs --done
// - pass multiple buyPrices --done
// @TODO: Check if multiple websocket connections can be stablished at same time.
// @TODO: Create reporter
// - PushBullet --done.
// - Email
// @BUG: script is terminating despite multiple pair monitoring.

// -b, -p, -t, -i
import minimist from 'minimist';
import start from './main';
import EventAggregator from './sources/event-aggregator';
import utils from './sources/utils';

const eventAggregator = EventAggregator.getInstance();
const argv = minimist( process.argv.slice( 2 ) );

utils.checkArgs( argv._ );

eventAggregator.subscribe( 'onConnectionTerminated', () => {
    process.exit();
});

const args = utils.getArgs( argv._  );

start( args.interval, args.params );
