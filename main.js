const config = require( './sources/config' ).binance;
const Trader = require( './sources/trader' );
const binance = require( 'node-binance-api' );
const PriceChecker = require( './sources/price-checker' );

class BinanceWrapper {
    /**
     * @param {string} pair 
     */
    constructor ( pair ) {
        this.currency = pair;
        this.tickerFn = binance.websockets.candlesticks;
        this.tickerFnParams = [ [pair], '1m' ];

        binance.options( config );
    }

    getBalances ( callback ) {
        binance.balance( (error, balances) => {
            if ( error ) {
                throw new Error( error );
            }
            callback( balances[ this.currency ] );
        });
    }
    
    placeTrailingStopOrder ( lossLimitPercent, trade ) {
        const priceChecker = new PriceChecker( trade, 5 );

        this.tickerFnParams.push( ( candlesticks ) => {
            let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks;
            let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks;

            if ( priceChecker.shouldSell( close ) ) {
                const evaluationPercent = priceChecker.getEvaluationPercent( close );

                console.log(
`Script terminated. Details:
- Acquired asset at $${ trade.price }
- Sold asset at $${ close }
- Valuation of $${ priceChecker.getEvaluation() }, a total of $${ evaluationPercent }.`
                );

            } else {
                console.log( `Close price: $${ close }, actual profit: $${ priceChecker.getEvaluationPercent( close ) }` );
            }

            priceChecker.setLastPrice( close );
        });

        this.tickerFn.apply( this.tickerFn, this.tickerFnParams );
    }
}

function run () {
    const trade = { price: 0.051397 };
    const binanceWrapper = new BinanceWrapper( 'DASHBTC' );

    binanceWrapper.placeTrailingStopOrder( 5, trade );
}

run();