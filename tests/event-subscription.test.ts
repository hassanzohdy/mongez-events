import events from "../src";

describe("Event Subscription", () => {
  afterEach(() => {
    events.off("test");
  });

  it("should subscribe to an event", () => {
    const subscription = events.subscribe("test", () => {});

    expect(subscription).toBeDefined();
  });

  it("should contain the exact callback listener in EventSubscription", () => {
    const callback = jest.fn();
    const subscription = events.subscribe("test", callback);

    expect(subscription.callback).toBe(callback);
  });

  it("should event subscription should return unsubscribe method", () => {
    const subscription = events.subscribe("test", () => {});

    expect(subscription.unsubscribe).toBeDefined();
  });

  it('should subscribe using "on" method', () => {
    const callback = jest.fn();
    const subscription = events.on("test", callback);

    expect(subscription.callback).toBe(callback);
  });

  it('should subscribe using "addEventListener" method', () => {
    const callback = jest.fn();
    const subscription = events.addEventListener("test", callback);

    expect(subscription.callback).toBe(callback);
  });

  it('should contain all event subscriptions using "subscriptions" method', () => {
    const callback = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    events.subscribe("test", callback);
    events.on("test", callback2);
    events.addEventListener("test", callback3);

    expect(events.subscriptions("test").length).toEqual(3);
  });
});
