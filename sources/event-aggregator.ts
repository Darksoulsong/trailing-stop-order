class EventAggregator {
    events: Map<string, ( data ) => void>
    constructor () {
        this.events = new Map();
    }

    publish ( eventName, data ) {
        if ( !this.events.has( eventName ) ) { return; }

        this.events.get( eventName )( data );
    }

    subscribe ( eventName, callback ) {
        this.events.set( eventName, callback );
    }

    unsubscribe ( eventName ) {
        this.events.delete( eventName );
    }

    clear () {
        this.events.clear();
    }
}

let instance: EventAggregator = null;
const obj = {

    getInstance (): EventAggregator {
        instance = instance || new EventAggregator();
        return instance;
    }
};

export default obj;
