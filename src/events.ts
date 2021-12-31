import EventsListeners from "./EventsListeners";
import {
  EventTriggerResponse,
  EventSubscription,
  EventListenersList,
} from "./types";

class Events {
  private events = new EventsListeners();

  /**
   * Add new callback to the given event
   * This method is alias to addEventListener
   *
   */
  public on(
    event: string,
    callback: Function
  ): EventSubscription | EventSubscription[] {
    return this.addEventListener(event, callback);
  }

  /**
   * Add event listener
   *
   * @param string|array event
   */
  public addEventListener(
    event: string,
    callback: Function
  ): EventSubscription | EventSubscription[] {
    if (event.includes(" ")) {
      let subscriptions: EventSubscription[] = [];
      for (let eventName of event.split(" ")) {
        subscriptions.push(this.subscribe(eventName, callback));
      }
      return subscriptions;
    } else {
      return this.subscribe(event, callback);
    }
  }

  /**
   * Subscribe to the given event
   */
  public subscribe(event: string, callback: Function): EventSubscription {
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
   *
   */
  public trigger(event: string, ...args: any[]) {
    if (event.includes(" ")) {
      let events: string[] = event.split(" ");
      const returns: { [key: string]: any } = {};
      for (let event of events) {
        returns[event] = this.trigger(event, ...args);
      }

      return returns;
    }

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
   * An alias to trigger method
   */
  public emit(event: string, ...args: any[]) {
    return this.trigger(event, ...args);
  }

  /**
   * Trigger the event and do not stop on event callback returning false
   *
   * @param {string} event
   * @param  {any[]} args
   * @returns {any[]}
   */
  public triggerAll(
    event: string,
    ...args: any[]
  ): EventTriggerResponse | EventTriggerResponse[] {
    if (event.includes(" ")) {
      let events = event.split(" ");
      let multipleEvents: EventTriggerResponse[] = [];

      for (let event of events) {
        multipleEvents.push(
          this.triggerAll(event, ...args) as EventTriggerResponse
        );
      }

      return multipleEvents;
    }

    const callbacks = this.events.get(event);

    let returnedOutput: EventTriggerResponse = {
      event,
      length: 0,
      results: [],
    };

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
   * Alias to off method
   */
  public unsubscribe(events: string) {
    return this.off(events);
  }

  /**
   * This method is used to clear event(s) or remove all events callbacks
   *
   * @param  {string|none} events
   */
  public off(events: string) {
    if (!events) {
      this.events.clear();
      return this;
    }

    const eventsList = events.split(" ");

    for (let event of eventsList) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * Remove all events that belongs to the given namespace
   *
   * @param   {string} namespace
   * @returns {Events}
   */
  public unsubscribeNamespace(namespace: string): Events {
    this.events.deleteByNamespace(namespace);
    return this;
  }

  /**
   * List all events by namespace
   *
   * @param {string} namespace
   * @returns {EventListenersList}
   */
  public getByNamespace(namespace: string): EventListenersList {
    return this.events.getByNamespace(namespace);
  }

  /**
   * Get all events listeners by namespace
   *
   * @param {string} namespace
   * @returns {EventSubscription[]}
   */
  public getByNamespaceArray(namespace: string): EventSubscription[] {
    return this.events.getByNamespaceArray(namespace);
  }
}

const events = new Events();

export default events;
