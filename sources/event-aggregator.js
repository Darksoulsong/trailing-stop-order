class EventAggregator {
    constructor () {
        this.events = new Map();
    }

    publish ( eventName, data ) {
        if ( !this.events.has( eventName ) ) { return; }

        const callback = this.events.get( eventName );
        callback( data );
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

let instance = null;
module.exports = {
    /**
     * @returns {EventAggregator}
     */
    getInstance () {
        instance = instance || new EventAggregator();
        return instance;
    }
};
