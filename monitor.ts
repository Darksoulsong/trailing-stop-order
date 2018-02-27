import * as minimist from 'minimist';
import * as forever from 'forever-monitor';
import EventAggregator from './sources/event-aggregator';
import utils from './sources/utils';

const argv = minimist( process.argv.slice( 2 ) );
const eventAggregator = EventAggregator.getInstance();

utils.checkArgs( argv._ );

const child = new forever.Monitor( 'index.js', {
    max: 1,
    silent: false,
    args: argv._
});

eventAggregator.subscribe( 'onConnectionTerminated', () => {
    child.stop();
    process.exitCode = 0;
});

child.on( 'exit', function () {
    console.log( 'Script terminated.' );
});

child.start();