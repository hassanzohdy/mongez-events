import { EventListenersList, EventSubscription } from "./types";

export default class EventsListeners {
  protected listeners: EventListenersList = {};
  public set(event: string, subscriptions: EventSubscription[]) {
    this.listeners[event] = subscriptions;
  }

  public get(event: string): EventSubscription[] {
    const subscriptions: EventSubscription[] = this.listeners[event] || [];

    return subscriptions;
  }

  public clear(): void {
    this.listeners = {};
  }

  public has(event: string): boolean {
    return typeof this.listeners[event] !== "undefined";
  }

  public delete(event: string): void {
    delete this.listeners[event];
  }

  public getByNamespace(namespace: string): EventListenersList {
    let events: EventListenersList = {};
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        events[event] = this.listeners[event];
      }
    }

    return events;
  }

  public getByNamespaceArray(namespace: string): EventSubscription[] {
    let eventSubscriptions: EventSubscription[] = [];
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        eventSubscriptions = [...eventSubscriptions, ...this.listeners[event]];
      }
    }

    return eventSubscriptions;
  }

  public deleteByNamespace(namespace: string): void {
    for (const event in this.listeners) {
      if (event.startsWith(namespace)) {
        delete this.listeners[event];
      }
    }
  }
}
