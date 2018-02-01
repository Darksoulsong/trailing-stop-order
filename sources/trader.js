const priceChecker = require( './price-checker' );

class Trader {
    constructor () {}

    getTrade () {
        return new Promise( function ( resolve, reject ) {
            setTimeout( function () {
                resolve({ price: 5760.8 });
            }, 200);
        });
    }

    ticker () {}

    getBalances () {}

    placeBuyOrder ( type ) {}

    placeSellOrder ( type ) {}

    cancelOrder ( type, id ) {}

    getTradeHistory () {}

    /** 
     * @param {number} lossLimit 
     **/
    placeTrailingStopOrder ( lossLimit ) {}
}

module.exports = Trader;