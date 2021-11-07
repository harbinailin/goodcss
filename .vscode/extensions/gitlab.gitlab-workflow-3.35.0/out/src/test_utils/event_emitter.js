"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
const events_1 = __importDefault(require("events"));
/**
 * This is an arbitrary name. The node event emitter supports multiple
 * types of events per emitter but we need only one, so we hardcode it.
 */
const EVENT_NAME = 'test-event';
/**
 * This is a test fake with simplified implementation of the vscode
 * EventEmitter. Thanks to this fake we can unit test logic that uses
 * vscode events.
 */
class EventEmitter {
    constructor() {
        this.eventEmitter = new events_1.default();
        this.event = (listener, thisArgs = {}) => {
            const nodeListener = (e) => listener.bind(thisArgs)(e);
            this.eventEmitter.on(EVENT_NAME, nodeListener);
            return {
                dispose: () => this.eventEmitter.removeListener(EVENT_NAME, nodeListener),
            };
        };
    }
    fire(data) {
        this.eventEmitter.emit(EVENT_NAME, data);
    }
    dispose() {
        this.eventEmitter.removeAllListeners();
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=event_emitter.js.map