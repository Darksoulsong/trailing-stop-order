declare namespace App.sources {
    type TTrade = {
        price: number
    }

    type TTickerDataReport = { 
        close: number, 
        appreciation: number, 
        appreciationPercent: string, 
        date: string 
    }

    type TTickerApreciationDataReport = {
        close: number, 
        appreciation: number, 
        appreciationPercent: string, 
        date: string, 
        differenceFromHighestPrice: number
    };

    type TTickerSellDataReport = {
        close: number, 
        appreciation: number, 
        appreciationPercent: string, 
        date: string, 
        tradePrice: number, 
        pair: string, 
        terminateConnection: boolean,
        differenceFromHighestPrice: number
    };

    type TStartParams = {
        pair: string, 
        buyPrice: number, 
        lossTolerance: number
    }

    interface ILogger {
        info(msg: string): void;
        error(msg: string): void;
        success(msg: string): void
    }
}