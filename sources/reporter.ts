// const config = require( './../config' );
// const logger = require( './logger' );
// const PushBullet = require( 'pushbullet' );
// const handlebars = require( 'handlebars' );
// const fs = require( 'fs' );

import config from './../config';
import logger from './logger';
import PushBullet from 'pushbullet';
import handlebars from 'handlebars';
import fs from 'fs';

class Reporter {
    successTplSource: string;
    logTplSource: string;
    pushBulletPusher: PushBullet;
    pushBulletDevice: string;
    constructor () {
        this.successTplSource = null;

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

    async report ( type: string, data: App.sources.TTickerDataReport ) {
        return await this[ `${ type }Report` ]( data );
    }

    appreciationReport ( params: App.sources.TTickerApreciationDataReport ) {
        let template;
        let msg;

        let compile = ( error, source, resolve ) => {
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