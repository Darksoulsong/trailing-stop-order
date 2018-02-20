# trailing-stop-order
A JS implementation to a trailing stop order for Binance Exchange. This is a work in progress.

## Running it: 
    - Single
    npm run start -- "i=30m" "p=DASHBTC-b=0.068408-l=0.2"

    - Multiple
    npm run start -- "i=30m" "p=DASHBTC-b=0.068408-l=0.2" "p=LTCBTC-b=0.008408-l=0.2"

Where:
 - **b** is the asset's buy price
 - **p** is the asset's pair
 - **l** is the maximum loss tolerance for the asset
 - **i** is the candlestick interval. The possible values are `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M`. Default value is `15m`.

 ## TODO:
 - Implement asset selling.

