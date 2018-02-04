const config = {
    binance: {
        APIKEY:         '',
        APISECRET:      '',
        useServerTime:  true,    // If you get timestamp errors, synchronize to server time at startup
        test:           false,   // If you want to use sandbox mode where orders are simulated,
        reconnect:      false
    },
    reporter: {
        pushBullet: {
            APIKEY:     '',
            deviceIden: ''
        }
    }
};

module.exports = config;
