declare namespace App.wrappers {
    type TParamsByPair = { [pair: string]: { lossTolerance: number, buyPrice: number } };
    interface IWrapper {
        placeTrailingStopOrder ( pair: string, interval: string, paramsByPair: TParamsByPair );
        terminateConnection ( subscription: string );
        getSubscription ( pair: string );
        sell ( pair: string, quantity: number, price: number, callback: ( error, response ) => void );
        getBalances ( param: any ): any;
    }

    interface IBinanceWrapper extends IWrapper {

        // https://stackoverflow.com/questions/41285211/typescript-overriding-interface-property-type-defined-in-d-ts
        getBalances( pair: string ): { [pair: string]: { available: number, onOrder: number } };
    }
}