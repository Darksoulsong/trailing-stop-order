const config = require( './../config' );
const logger = require( './logger' );
const PushBullet = require( 'pushbullet' );
const handlebars = require( 'handlebars' );
const fs = require( 'fs' );

class Reporter {
    constructor () {
        /** @type {string} */
        this.successTplSource = null;

        /** @type {string} */
        this.logTplSource = null;

        this.preparePushBullet();
    }

    preparePushBullet () {
        this.pushBulletPusher = new PushBullet( config.reporter.pushBullet.APIKEY );
        this.pushBulletDevice = config.reporter.pushBullet.deviceIden;
        // this.pushBulletPusher.devices(function (err, resp) { 
        //     console.log( resp.devices );
        // });
    }

    /**
     * @param {string} type 
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} data 
     */
    async report ( type, data ) {
        return await this[ `${type}Report` ]( data );
    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string, differenceFromHighestPrice: number}} params 
     */
    appreciationReport ( params ) {
        let template;
        let msg;

        let compile = ( error, source ) => {
            if ( error ) {
                throw new Error( error );
            }

            this.logTplSource = source;

            let template = handlebars.compile( source );
            let msg = template( params );

            logger.info( msg );
        };

        return new Promise( (resolve, reject ) => {

            if ( this.logTplSource ) {
                compile( null, this.logTplSource, resolve );
            } else {
                fs.readFile( './sources/templates/report-appreciation.tpl.html', 'utf-8', ( err, src ) => {
                    compile( err, src, resolve );
                });
            }

        });

    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string, tradePrice: number, pair: string, differenceFromHighestPrice: number}} params 
     */
    sellReport ( params ) {
        let msg;
        let template;        

        /**
         * @param {*} error 
         * @param {string} source 
         */
        let compile = ( error, source, resolve, reject ) => {

            if ( error ) {
                throw new Error( error );
            }

            template = handlebars.compile( source );
            msg = template( params );

            logger.success( msg );

            this.pushBulletPusher.note( this.pushBulletDevice, "Trailing stop order fulfilled", msg, ( error, response ) => {
                if ( error ) {
                    let errorMsg = `An error has occurred on trying to push a note to PushBullet. Details: ${ error }`;
                    logger.error( errorMsg );

                    if ( reject ) { reject( errorMsg ); }
                }
            });

            this.successTplSource = source;

            if ( resolve )  { resolve(); }
        };

        return new Promise( ( resolve, reject ) => {

            if ( this.successTplSource ) {
                compile( null, this.successTplSource, resolve, reject );
            } else {
                fs.readFile( './sources/templates/report-success.tpl.html', 'utf-8', ( err, src ) => {
                    compile( err, src, resolve, reject );
                });
            }
        });

    }
}

let instance = null;
module.exports = {
    /**
     * @returns {Reporter}
     */
    getInstance () {
        instance = instance || new Reporter();
        return instance;
    }
};