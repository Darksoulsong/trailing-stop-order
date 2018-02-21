declare namespace App.wrappers {
    type TParamsByPair = { [pair: string]: { lossTolerance: number, buyPrice: number } };
    interface IWrapper {
        placeTrailingStopOrder ( pair: string, interval: number, paramsByPair: TParamsByPair )
    }
}