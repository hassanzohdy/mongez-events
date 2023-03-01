import { EventListeners, EventListenersList, EventSubscription } from "./types";

export default class EventsListeners {
  protected listeners: EventListeners = {};

  /**
   * Add event subscriptions
   */
  public set(event: string, subscriptions: EventSubscription[]) {
    this.listeners[event] = subscriptions;
  }

  /**
   * Get all subscriptions for the given event
   */
  public get(event: string) {
    const subscriptions: EventSubscription[] = this.listeners[event] || [];

    return subscriptions;
  }

  /**
   * Clear all events
   */
  public clear() {
    this.listeners = {};
  }

  /**
   * Check if the given event has subscriptions
   */
  public has(event: string) {
    return typeof this.listeners[event] !== "undefined";
  }

  /**
   * Delete the given event
   */
  public delete(event: string) {
    delete this.listeners[event];
  }

  /**
   * List all events by namespace
   */
  public getByNamespace(namespace: string) {
    let events: EventListeners = {};
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        events[event] = this.listeners[event];
      }
    }

    return events;
  }

  /**
   * Get all events listeners by namespace as an array
   */
  public getByNamespaceArray(namespace: string) {
    let eventSubscriptions: EventListenersList = [];
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        eventSubscriptions.push({
          event: event,
          subscriptions: this.listeners[event],
        });
      }
    }

    return eventSubscriptions;
  }

  /**
   * Delete all events that belongs to the given namespace
   * i.e "users" namespace will affect on: users.created, users.updated, users.deleted will be deleted
   */
  public deleteByNamespace(namespace: string): void {
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        delete this.listeners[event];
      }
    }
  }
}
