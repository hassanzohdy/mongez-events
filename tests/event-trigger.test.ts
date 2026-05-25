import { afterEach, describe, expect, it, vi } from "vitest";
import events from "../src";

describe("Event Trigger", () => {
  afterEach(() => {
    events.off("test");
  });

  it("should trigger an event", () => {
    const callback = vi.fn();
    events.subscribe("test", callback);
    events.trigger("test");

    expect(callback).toHaveBeenCalled();
  });

  it("should return value from event trigger", () => {
    const callback = vi.fn(() => "test");
    events.subscribe("test", callback);
    const result = events.trigger("test");

    expect(result).toEqual("test");
  });

  it("should stop calling event listeners after one returns false", () => {
    const callback = vi.fn(() => false);
    const callback2 = vi.fn(() => true);
    events.subscribe("test", callback);
    events.subscribe("test", callback2);
    events.trigger("test");

    expect(callback).toHaveBeenCalled();
    expect(callback2).not.toHaveBeenCalled();
  });
});
