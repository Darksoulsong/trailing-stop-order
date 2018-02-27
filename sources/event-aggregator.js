"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventAggregator = (function () {
    function EventAggregator() {
        this.events = new Map();
    }
    EventAggregator.prototype.publish = function (eventName, data) {
        if (!this.events.has(eventName)) {
            return;
        }
        this.events.get(eventName)(data);
    };
    EventAggregator.prototype.subscribe = function (eventName, callback) {
        this.events.set(eventName, callback);
    };
    EventAggregator.prototype.unsubscribe = function (eventName) {
        this.events.delete(eventName);
    };
    EventAggregator.prototype.clear = function () {
        this.events.clear();
    };
    return EventAggregator;
}());
var instance = null;
var obj = {
    getInstance: function () {
        instance = instance || new EventAggregator();
        return instance;
    }
};
exports.default = obj;
//# sourceMappingURL=event-aggregator.js.map