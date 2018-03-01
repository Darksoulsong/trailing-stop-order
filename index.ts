// @TODO: Create reporter
// - Email

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
const Wrapper = utils.getWrapper( args.exchange );

start( args.interval, args.params, Wrapper );
