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
}