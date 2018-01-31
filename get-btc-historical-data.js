/**
 * Get BTC Historical data from CoinMarketCap
 */

 // https://coinmarketcap.com/currencies/bitcoin/historical-data/?start=20171024&end=20180124

var $table = document.querySelector('table.table');
var data = [];

/**
 * @param {string} str 
 */
function formatNumber ( str ) {
	let s = str;

	while ( s.indexOf( '.' ) !== -1 ) {
		s = s.replace( '.', '' );
	}

	s = s.replace( ',', '.' );

	return +s;
}

for ( let $row of $table.rows ) {
    if ( $row.rowIndex === 0 ) { continue; }

    let candle = {
    	date: new Date($row.cells[ 0 ].innerText).getTime(),
        open: formatNumber( $row.cells[ 1 ].innerText ),
		high: formatNumber( $row.cells[ 2 ].innerText ),
		low: formatNumber( $row.cells[ 3 ].innerText ),
		close: formatNumber( $row.cells[ 4 ].innerText ),
		volume: formatNumber( $row.cells[ 5 ].innerText ),
		marketCap: formatNumber( $row.cells[ 6 ].innerText )
    };

    data.push( candle );
}

// console.table( data );
console.log( JSON.stringify( data ) );
