export default {

    getSymbol ( pair: string, symbols: { [pair: string]: any } ) {
        pair = pair.toUpperCase();

        let symbol = null;
        let pairArr = pair.split( '' );
        let found;

        loop:        
        for ( let element in symbols ) {
            let arr1 = [];
            let arr2 = [];
            let symbolToArray = element.split( '' );

            for ( let y = 0; y < symbolToArray.length; y++ ) {
                let char = symbolToArray[ y ];
                arr1.push( char );
                
                if ( !pairArr[ y ] ) { continue; }
                
                arr2[ y ] = pairArr[ y ];
    
                if ( arr1.length >= 3 ) {
                    if ( arr2.join('').indexOf( arr1.join('') ) !== -1 ) {
    
                        if ( found ) {
                            if ( arr1.join( '' ) === arr2.join( '' ) ) {
                                symbol = element;
                            } else {
                                symbol = found;
                            }
    
                            break loop;
                        }
    
                        found = element;
                    }
                }
            }
        }

        if ( !!found && !symbol ) {
            symbol = found;
        }
        
        return symbol;
    },

    checkArgs ( args: string[] ) {
    
        args.forEach( ( arg ) => {
            const supplied = [];
    
            arg.split( '-' ).forEach( ( element ) => {
                supplied.push( element.split( '=' )[ 0 ] );
            });
    
            if ( supplied.length === 1 && supplied[ 0 ] === 'i' ) { return; }
    
            if ( 
                supplied.indexOf( 'p' ) === -1
                || supplied.indexOf( 'b' ) === -1
                || supplied.indexOf( 'l' ) === -1
            ) {
                throw new Error( 'Required params missing. Check "p" (pair), "b" (buyPrice), "l" (loss tolerance)' );
            }
        });
    },

    getArgs ( args: string[] ) {
        // [ 
        //     "e=binance",
        //     "i=30m",
        //     "p=DASHBTC-b=0.068408-i=15m-l=0.2",
        //     "p=LTCBTC-b=0.008408-i=30m-l=0.2"
        // ]

        let params = [];
        let interval = "30m";
        let exchange = "binance";
        let iIndex = args.findIndex( ( element ) => {
            return element.indexOf( 'i=' ) !== -1;
        });
        let eIndex = args.findIndex( ( element ) => {
            return element.indexOf( 'e=' ) !== -1;
        });
    
        if ( iIndex !== -1 ) {
            interval = args.splice( iIndex, 1 )[ 0 ].split( '=' )[ 1 ];
        }

        if ( eIndex !== -1 ) {
            exchange = args.splice( eIndex, 1 )[ 0 ].split( '=' )[ 1 ];
        }
    
        args.forEach( ( arg: string ) => {
            const obj = {
                pair: null,
                buyPrice: null,
                lossTolerance: null
            };
    
            arg.split( '-' ).forEach( ( item ) => {
                item.split( '=' ).forEach( ( a, index, arr ) => {
                    if ( index === 1 ) { return; }
    
                    switch ( a ) {
                        case 'p':
                            obj.pair = arr[ 1 ];
                            break;
                        case 'b':
                            obj.buyPrice = +arr[ 1 ];
                            break;
                        default:
                            obj.lossTolerance = +arr[ 1 ];
                            break;
                    }
                });
            });
    
            params.push( obj );
    
        });
    
        return {
            exchange,
            interval,
            params
        };
    },

    getWrapper ( name: string ) {
        return require( `./wrappers/${name}-wrapper` ).default;
    }
}