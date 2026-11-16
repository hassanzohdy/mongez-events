import { describe, expect, it, vi } from "vitest";
import events from "../src";

describe("Event Unsubscribe", () => {
  it("should unsubscribe from an event", () => {
    const callback = vi.fn();
    const subscription = events.subscribe("test", callback);
    subscription.unsubscribe();
    events.trigger("test");
    expect(callback).not.toHaveBeenCalled();
  });

  it('should unsubscribe from an event using "unsubscribe" method', () => {
    const callback = vi.fn();
    const callback2 = vi.fn();

    events.subscribe("test", callback);
    events.subscribe("test", callback2);

    events.unsubscribe("test");

    events.trigger("test");

    expect(callback).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should unsubscribe from an event using "off" method', () => {
    const callback = vi.fn();
    const callback2 = vi.fn();

    events.subscribe("test", callback);
    events.subscribe("test", callback2);

    events.off("test");

    events.trigger("test");

    expect(callback).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it("should unsubscribe from all events subscriptions", () => {
    const callback = vi.fn();
    const callback2 = vi.fn();

    events.subscribe("test", callback);
    events.subscribe("test", callback2);

    events.unsubscribe();

    events.trigger("test");

    expect(callback).not.toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });

  it("should not skip the next listener when one unsubscribes itself during dispatch", async () => {
    const calls: string[] = [];
    const a = vi.fn(() => {
      calls.push("a");
      subA.unsubscribe();
    });
    const b = vi.fn(() => {
      calls.push("b");
    });
    const c = vi.fn(() => {
      calls.push("c");
    });

    const subA = events.subscribe("unsub-during-dispatch", a);
    events.subscribe("unsub-during-dispatch", b);
    events.subscribe("unsub-during-dispatch", c);

    events.trigger("unsub-during-dispatch");
    expect(calls).toEqual(["a", "b", "c"]);

    // a is gone now; the others keep running on every trigger variant.
    calls.length = 0;
    events.triggerAll("unsub-during-dispatch");
    await events.triggerAsync("unsub-during-dispatch");
    await events.triggerAllAsync("unsub-during-dispatch");
    expect(calls).toEqual(["b", "c", "b", "c", "b", "c"]);

    events.unsubscribe("unsub-during-dispatch");
  });

  it("should not call a later listener that an earlier one unsubscribed during dispatch", async () => {
    for (const method of [
      "trigger",
      "triggerAll",
      "triggerAsync",
      "triggerAllAsync",
    ] as const) {
      const calls: string[] = [];
      const name = `unsub-other-${method}`;

      events.subscribe(name, () => {
        calls.push("a");
        subC.unsubscribe();
      });
      events.subscribe(name, () => {
        calls.push("b");
      });
      const subC = events.subscribe(name, () => {
        calls.push("c");
      });

      await events[method](name);

      expect(calls).toEqual(["a", "b"]);

      events.unsubscribe(name);
    }
  });
});
