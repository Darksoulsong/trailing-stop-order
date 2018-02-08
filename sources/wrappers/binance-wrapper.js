const binance = require( 'node-binance-api' );
const config = require( './../../config' ).binance;
const PriceChecker = require( './../price-checker' );
const eventAggregator = require( './../event-aggregator' ).getInstance();

class BinanceWrapper {
    /**
     * @param {string} pair 
     * @param {string} interval 
     */
    constructor ( pair, interval ) {
        this.pair = pair;
        this.tickerFn = binance.websockets.candlesticks;
        this.tickerFnParams = [ [ pair ], interval ];

        binance.options( config );
    }

    getBalances ( callback ) {
        binance.balance( (error, balances) => {
            if ( error ) {
                throw new Error( error );
            }
            callback( balances[ this.pair ] );
        });
    }

    placeTrailingStopOrder ( lossLimitPercent, trade ) {
        const priceChecker = new PriceChecker( trade, lossLimitPercent );

        function onTick ( candlesticks ) {
            
            let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
            let date = format( new Date( eventTime ), "D/MM/YYYY - HH:mm:ss" );
            let { 
                o: open, 
                h: high, 
                l: low, 
                c: close, 
                v: volume, 
                n: trades, 
                i: interval, 
                x: isFinal, 
                q: quoteVolume, 
                V: buyVolume, 
                Q: quoteBuyVolume 
            } = ticks;

            close = +close;

            const appreciation = priceChecker.getAppreciation();
            const appreciationPercent = priceChecker.getAppreciationPercent( close );

            priceChecker.setLastPrice( close );

            if ( priceChecker.shouldSell( close ) ) {

                const terminateConnection = true;
                eventAggregator.publish( 'onTickReportSell', { 
                    close, 
                    date, 
                    appreciation, 
                    appreciationPercent, 
                    terminateConnection 
                });

            } else {

                eventAggregator.publish( 'onTickReportAppreciation', { 
                    close, 
                    date, 
                    appreciation, 
                    appreciationPercent 
                });

            }
        }

        this.tickerFnParams.push( onTick );

        try {
            this.tickerFn.apply( this.tickerFn, this.tickerFnParams );    
        } catch ( error ) {
            if ( error.message.indexOf( '502' ) !== -1 ) {
                throw new Error( 'Can\'t connect to the server this time. Try again later.' );
            }

            throw error;
        }        
    }

    terminateConnection () {
        let endpoints = binance.websockets.subscriptions();

        for ( let endpoint in endpoints ) {
            binance.websockets.terminate( endpoint );

            eventAggregator.publish( 'onConnectionTerminated', endpoint );
        }
    }
}

module.exports = BinanceWrapper;