import { EventListeners, EventListenersList, EventSubscription } from "./types";

export default class EventsListeners {
  protected listeners: Map<string, EventSubscription[]> = new Map();

  /**
   * Add event subscriptions
   */
  public set(event: string, subscriptions: EventSubscription[]) {
    this.listeners.set(event, subscriptions);
  }

  /**
   * Get all subscriptions for the given event
   */
  public get(event: string) {
    const subscriptions: EventSubscription[] = this.listeners.get(event) || [];

    return subscriptions;
  }

  /**
   * Clear all events
   */
  public clear() {
    this.listeners = new Map();
  }

  /**
   * Check if the given event has subscriptions
   */
  public has(event: string) {
    return this.listeners.has(event);
  }

  /**
   * Delete the given event
   */
  public delete(event: string) {
    this.listeners.delete(event);
  }

  /**
   * Match an event name against a namespace by segment boundary, not by raw
   * prefix. Without this, `"users.created"` matches the namespace `"user"`
   * (false positive) and destroying namespace `"atoms.foo.clone.1"` would
   * also wipe `"atoms.foo.clone.10"`, `"atoms.foo.clone.100"`, etc.
   */
  protected matchesNamespace(event: string, namespace: string): boolean {
    return event === namespace || event.startsWith(namespace + ".");
  }

  /**
   * List all events by namespace
   */
  public getByNamespace(namespace: string) {
    let events: EventListeners = {};
    for (const [event, subscriptions] of this.listeners) {
      if (this.matchesNamespace(event, namespace)) {
        events[event] = subscriptions;
      }
    }

    return events;
  }

  /**
   * Get all events listeners by namespace as an array
   */
  public getByNamespaceArray(namespace: string) {
    let eventSubscriptions: EventListenersList = [];
    for (const [event, subscriptions] of this.listeners) {
      if (this.matchesNamespace(event, namespace)) {
        eventSubscriptions.push({
          event: event,
          subscriptions,
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
    for (const event of this.listeners.keys()) {
      if (this.matchesNamespace(event, namespace)) {
        this.listeners.delete(event);
      }
    }
  }
}
