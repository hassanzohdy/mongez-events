import { afterEach, describe, expect, it, vi } from "vitest";
import events from "../src";

const reservedNames = ["__proto__", "constructor", "toString", "hasOwnProperty", "valueOf"];

describe("Event reserved property names", () => {
  afterEach(() => {
    for (const name of reservedNames) {
      events.off(name);
    }
  });

  it.each(reservedNames)(
    "should subscribe and trigger an event literally named %s without throwing",
    name => {
      const callback = vi.fn();

      expect(() => events.subscribe(name, callback)).not.toThrow();
      expect(() => events.trigger(name)).not.toThrow();

      expect(callback).toHaveBeenCalledOnce();
    },
  );

  it.each(reservedNames)(
    "should unsubscribe an event literally named %s",
    name => {
      const callback = vi.fn();
      const subscription = events.subscribe(name, callback);

      subscription.unsubscribe();
      events.trigger(name);

      expect(callback).not.toHaveBeenCalled();
    },
  );

  it("should not pollute Object.prototype or corrupt the registry when using __proto__", () => {
    const callback = vi.fn();

    events.subscribe("__proto__", callback);
    events.trigger("__proto__");

    expect(callback).toHaveBeenCalledOnce();

    // Unrelated events must remain unaffected by the reserved-name subscription.
    const otherCallback = vi.fn();
    events.subscribe("some-other-event", otherCallback);
    events.trigger("some-other-event");
    events.off("some-other-event");

    expect(otherCallback).toHaveBeenCalledOnce();
    expect(({} as any).polluted).toBeUndefined();
  });

  it("should report subscriptions correctly for a reserved-name event", () => {
    events.subscribe("toString", vi.fn());
    events.subscribe("toString", vi.fn());

    expect(events.subscriptions("toString").length).toEqual(2);
  });

  it("should trigger an event named with a reserved name that was never subscribed to without throwing", () => {
    expect(() => events.trigger("constructor")).not.toThrow();
    expect(events.trigger("constructor")).toBeUndefined();
  });
});
