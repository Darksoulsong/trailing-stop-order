const config = require( './../config' );
const logger = require( './logger' );
const PushBullet = require( 'pushbullet' );

class Reporter {
    constructor () {
        this.preparePushBullet();
    }

    preparePushBullet () {
        this.pushBulletPusher = new PushBullet( config.reporter.pushBullet.APIKEY );
        this.pushBulletDevice = config.reporter.pushBullet.deviceIden;
    }

    /**
     * @param {string} type 
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} data 
     */
    report ( type, data ) {
        this[ `${type}Report` ]( data );
    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} params 
     */
    appreciationReport ( params ) {
        // console.log( `${ params.date } - Close price: $${ params.close }, appreciation: $${ params.appreciationPercent }` );
        logger.info( `${ params.date } - Close price: $${ params.close }, appreciation: $${ params.appreciationPercent }` );
    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string, tradePrice: number, pair: string}} params 
     */
    sellReport ( params ) {
        const msg = `${ params.date }: 
Your position in ${ pair } has been exited. Details:
- Acquired asset at $${ params.tradePrice }
- Sold asset at $${ params.close }
- Appreciation of $${ params.appreciation }, a total of $${ params.appreciationPercent }.`;

        // console.log( msg );
        logger.success( msg );

        this.pushBulletPusher.note( this.pushBulletDevice, "Trailing stop order fulfilled", msg, ( error, response ) => {
            if ( error ) {
                console.error( `An error has occurred on trying to push a note to PushBullet. Details: ${ error }` );
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