# trailing-stop-order
A JS implementation to a trailing stop order for Binance Exchange. This is a work in progress.

## Running it:
    npm run start -- -b 0.068408 -p 'DASHBTC' -t '0.5' -i '1m'

Where:
 - **-b** is the asset's buy price
 - **-p** is the asset's pair
 - **-t** is the maximum loss tolerante for the asset
 - **-i** is the candlestick interval. The possible values are `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M`. Default value is `1m`.

 ## TODO:
 - Implement asset selling.
 - Implement param checking.

