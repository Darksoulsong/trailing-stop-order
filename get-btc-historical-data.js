/**
 * Get BTC Historical data from CoinMarketCap
 */

 // https://coinmarketcap.com/currencies/bitcoin/historical-data/?start=20171024&end=20180124

var $table = document.querySelector('table.table');
var data = [];
for ( let $row of $table.rows ) {
    if ( $row.rowIndex === 0 ) { continue; }

    let candle = {
    	date: new Date($row.cells[ 0 ].innerText).getTime(),
        open: $row.cells[ 1 ].innerText,
		high: $row.cells[ 2 ].innerText,
		low: $row.cells[ 3 ].innerText,
		close: $row.cells[ 4 ].innerText,
		volume: $row.cells[ 5 ].innerText,
		marketCap: $row.cells[ 6 ].innerText
    };

    data.push( candle );
    
}

console.table( data )