# trailing-stop-order
A Javascript implementation to a trailing stop order for Binance Exchange. This is a work in progress.

## Installation
- Clone this repo and run `npm install`. It will download all the project's dependencies.

## Setting up
- Visit your Binance account and generate an API key.
- Add a `./config.js` file and configure it using the `./config.sample.js` as example.

## Running it: 
- Single
    npm run start -- "e=exchange" "i=30m" "p=DASHBTC-b=0.068408-l=0.2"


- Multiple pairs

    npm run start -- "e=exchange" "i=30m" "p=DASHBTC-b=0.068408-l=0.2" "p=LTCBTC-b=0.008408-l=0.2"

Where:
 - **b** is the asset's buy price (*required*)
 - **p** is the asset's pair (*required*)
 - **l** is the maximum loss tolerance for the asset (*required*)
 - **e** is the exchange API. Default value is `binance` (only Binance exchange is supported at the moment)
 - **i** is the candlestick interval. The possible values are `1m`, `3m`, `5m`, `15m`, `30m`, `1h`, `2h`, `4h`, `6h`, `8h`, `12h`, `1d`, `3d`, `1w`, `1M`. Default value is `30m`.

 ## TODO:
 - Implement asset selling.

