// @TODO: Create param checking:
// - "-p" format (PAIR=buyPrice)
// @TODO: Get the wrapper based on the params passed
// @TODO: Create reporter
// - PushBullet --done.
// - Email

// -b, -p, -t, -i
import * as minimist from 'minimist';
import start from './main';
import EventAggregator from './sources/event-aggregator';
import utils from './sources/utils';

const eventAggregator = EventAggregator.getInstance();
const argv = minimist( process.argv.slice( 2 ) );

utils.checkArgs( argv._ );

eventAggregator.subscribe( 'onConnectionTerminated', () => {
    process.exit();
});

const args = utils.getArgs( argv._ );
const Wrapper = utils.getWrapper( 'binance' );

start( args.interval, args.params, Wrapper );
