class Reporter {
    constructor () {}

    /**
     * @param {string} type 
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} data 
     */
    report ( type, data ) {
        this[ `${type}Report` ]( data );
    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} params 
     */
    appreciationReport ( params ) {
        console.log( `${ params.date } - Close price: $${ params.close }, appreciation: $${ params.appreciationPercent }` );
    }

    /**
     * @param {{close: number, appreciation: number, appreciationPercent: string, date: string}} params 
     */
    sellReport ( params ) {
        console.log(
`${ params.date } - Script terminated. Details:
- Acquired asset at $${ trade.price }
- Sold asset at $${ params.close }
- Appreciation of $${ params.appreciation }, a total of $${ params.appreciationPercent }.`
        );
    }
}

let instance = null;
module.exports = {
    /**
     * @returns {Reporter}
     */
    getInstance () {
        instance = instance || new EventAggregator();
        return instance;
    }
};