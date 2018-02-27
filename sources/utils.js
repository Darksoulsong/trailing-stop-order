"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    checkArgs: function (args) {
        args.forEach(function (arg) {
            var supplied = [];
            arg.split('-').forEach(function (element) {
                supplied.push(element.split('=')[0]);
            });
            if (supplied.length === 1 && supplied[0] === 'i') {
                return;
            }
            if (supplied.indexOf('p') === -1
                || supplied.indexOf('b') === -1
                || supplied.indexOf('l') === -1) {
                throw new Error('Required params missing. Check "p" (pair), "b" (buyPrice), "l" (loss tolerance)');
            }
        });
    },
    getArgs: function (args) {
        // [ 
        //     "e=binance",
        //     "i=30m",
        //     "p=DASHBTC-b=0.068408-i=15m-l=0.2",
        //     "p=LTCBTC-b=0.008408-i=30m-l=0.2"
        // ]
        var params = [];
        var interval = null;
        var exchange = null;
        var iIndex = args.findIndex(function (element) {
            return element.indexOf('i=') !== -1;
        });
        var eIndex = args.findIndex(function (element) {
            return element.indexOf('e=') !== -1;
        });
        if (iIndex !== -1) {
            interval = args.splice(iIndex, 1)[0].split('=')[1];
        }
        if (eIndex !== -1) {
            exchange = args.splice(eIndex, 1)[0].split('=')[1];
        }
        args.forEach(function (arg) {
            var obj = {
                pair: null,
                buyPrice: null,
                lossTolerance: null
            };
            arg.split('-').forEach(function (item) {
                item.split('=').forEach(function (a, index, arr) {
                    if (index === 1) {
                        return;
                    }
                    switch (a) {
                        case 'p':
                            obj.pair = arr[1];
                            break;
                        case 'b':
                            obj.buyPrice = +arr[1];
                            break;
                        default:
                            obj.lossTolerance = +arr[1];
                            break;
                    }
                });
            });
            params.push(obj);
        });
        return {
            exchange: exchange,
            interval: interval,
            params: params
        };
    },
    getWrapper: function (name) {
        return require("./wrappers/" + name + "-wrapper").default;
    }
};
//# sourceMappingURL=utils.js.map