import * as vscode from 'vscode';
import NodeEmitter from 'events';

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
export class EventEmitter<T> implements vscode.EventEmitter<T> {
  eventEmitter: NodeEmitter = new NodeEmitter();

  event = (listener: (e: T) => any, thisArgs: any = {}): vscode.Disposable => {
    const nodeListener = (e: T) => listener.bind(thisArgs)(e);
    this.eventEmitter.on(EVENT_NAME, nodeListener);
    return {
      dispose: () => this.eventEmitter.removeListener(EVENT_NAME, nodeListener),
    };
  };

  fire(data: T): void {
    this.eventEmitter.emit(EVENT_NAME, data);
  }

  dispose(): void {
    this.eventEmitter.removeAllListeners();
  }
}
