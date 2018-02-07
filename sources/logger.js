const winston = require('winston');
const winstonRotator = require('winston-daily-rotate-file');

const datePattern = "dd-MM-yyyy-";
const logsDir = 'logs/';
const consoleConfig = [
    new winston.transports.Console({
        'colorize': true
    })
];

/**
 * @param {string} type
 */
function createLogger ( type ) {

    const loggerInstance = new winston.Logger({
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

const logger = {
    /**
     * @param {string} msg 
     */
    info ( msg ) {
        createLogger( 'info' ).info( msg );
    },

    /**
     * @param {string} msg 
     */
    error ( msg ) {
        createLogger( 'error' ).error( msg );
        errorLogger.error( msg );
    },

    /**
     * @param {string} msg 
     */
    success ( msg ) {
        createLogger( 'success' ).info( msg );
    }
};

module.exports = logger;