// const winston = require('winston');
// const winstonRotator = require('winston-daily-rotate-file');
import { transports, Logger } from 'winston';
import winstonRotator from 'winston-daily-rotate-file';

const datePattern = "dd-MM-yyyy-";
const logsDir = 'logs/';
const consoleConfig = [
    new transports.Console({
        'colorize': true
    })
];

function createLogger ( type: string ) {
    const loggerInstance = new Logger({
        'transports': consoleConfig
    });

    const typeToLevel = {
        'info': 'info',
        'error': 'error',
        'success': 'info'
    };

    loggerInstance.add( winstonRotator, {
        'name': `${ typeToLevel[ type ] }-file`,
        'level': `${ typeToLevel[ type ] }`,
        'filename': `${ logsDir }report-${ type }.log`,
        'json': false,
        'datePattern': datePattern,
        'prepend': true
    });

    return loggerInstance;
}

const infoLogger = createLogger( 'info' );
const errorLogger = createLogger( 'error' );
const successLogger = createLogger( 'success' );


const logger = {

    info ( msg: string ) {
        infoLogger.info( msg );
    },
 
    error ( msg: string ) {
        errorLogger.error( msg );
    },

    success ( msg: string ) {
        successLogger.info( msg );
    }
};

export default logger;
