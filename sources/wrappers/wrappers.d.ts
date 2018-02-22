declare namespace App.wrappers {
    type TParamsByPair = { [pair: string]: { lossTolerance: number, buyPrice: number } };
    interface IWrapper {
        placeTrailingStopOrder ( pair: string, interval: string, paramsByPair: TParamsByPair );
        terminateConnection ( subscription: string );
        getSubscription ( pair: string );
    }
}