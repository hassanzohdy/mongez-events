import EventsListeners from "./EventsListeners";
import { EventSubscription, EventTriggerResponse } from "./types";

class Events {
  /**
   * Events listeners
   */
  private events = new EventsListeners();

  /**
   * Add new callback to the given event
   *
   * @alias subscribe
   */
  public on(event: string, callback: Function) {
    return this.addEventListener(event, callback);
  }

  /**
   * @alias subscribe
   */
  public addEventListener(event: string, callback: Function) {
    return this.subscribe(event, callback);
  }

  /**
   * Subscribe to the given event
   */
  public subscribe(event: string, callback: Function) {
    const eventHandler = this.events.get(event) || [];
    let subscription: EventSubscription = {
      callback,
      event,
      dispatch(...args) {
        return callback(...args);
      },
      unsubscribe: () => {
        let index = eventHandler.indexOf(subscription);
        if (index !== -1) {
          eventHandler.splice(index, 1);
        }
      },
    };

    eventHandler.push(subscription);

    this.events.set(event, eventHandler);

    return subscription;
  }

  /**
   * Trigger the given event
   */
  public trigger(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);

    if (callbacks.length === 0) return;

    let returnValue;

    for (let callback of callbacks) {
      let callbackReturn = callback.dispatch(...args);

      if (callbackReturn === false) {
        return false;
      } else if (callbackReturn !== undefined) {
        returnValue = callbackReturn;
      }
    }

    return returnValue;
  }

  /**
   * @alias trigger
   */
  public emit(event: string, ...args: any[]) {
    return this.trigger(event, ...args);
  }

  /**
   * Trigger the event and do not stop on event callback returning false
   */
  public triggerAll(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);

    let returnedOutput: EventTriggerResponse = {
      event,
      length: 0,
      results: [],
    };

    if (callbacks.length === 0) {
      return returnedOutput;
    }

    for (let callback of callbacks) {
      let callbackReturn = callback.dispatch(...args);

      returnedOutput.length++;

      if (callbackReturn !== undefined) {
        returnedOutput.results.push(callbackReturn);
      }
    }

    return returnedOutput;
  }

  /**
   * Remove all events subscriptions
   */
  public unsubscribe(event?: string) {
    if (!event) {
      this.events.clear();
      return this;
    }

    this.events.delete(event);

    return this;
  }

  /**
   * @alias unsubscribe
   */
  public off(events?: string) {
    return this.unsubscribe(events);
  }

  /**
   * Remove all events that belongs to the given namespace
   */
  public unsubscribeNamespace(namespace: string) {
    this.events.deleteByNamespace(namespace);
    return this;
  }

  /**
   * List all events by namespace
   */
  public getByNamespace(namespace: string) {
    return this.events.getByNamespace(namespace);
  }

  /**
   * Get all events listeners by namespace
   */
  public getByNamespaceArray(namespace: string) {
    return this.events.getByNamespaceArray(namespace);
  }

  /**
   * Get all event subscriptions for the given event
   */
  public subscriptions(event: string) {
    return this.events.get(event);
  }
}

const events = new Events();

export default events;
