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
});
