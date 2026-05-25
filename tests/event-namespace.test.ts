import { beforeEach, describe, expect, it, vi } from "vitest";
import events from "../src";

describe("Event Namespace", () => {
  beforeEach(() => {
    events.unsubscribe();
  });

  it("should return all events in array of objects using namespace", () => {
    const callback = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();

    events.subscribe("namespaceTest", callback);
    events.subscribe("test2", callback2);
    events.subscribe("namespaceTest.test", callback3);

    const results = events.getByNamespaceArray("namespaceTest");

    expect(results.length).toEqual(2);
  });

  it("should return all events in object using namespace", () => {
    const callback = vi.fn();
    const callback2 = vi.fn();
    const callback3 = vi.fn();
    const callback4 = vi.fn();

    events.subscribe("namespaceTest", callback);
    events.subscribe("test2", callback2);
    events.subscribe("namespaceTest.test", callback3);
    events.subscribe("namespaceTest.test", callback4);

    const results = events.getByNamespace("namespaceTest");

    expect(results.namespaceTest.length).toEqual(1);
    expect(results["namespaceTest.test"].length).toEqual(2);
  });

  it("REGRESSION: namespace match respects segment boundaries", () => {
    // Pre-fix, the raw `startsWith` would match `users.10` and `users.100`
    // when asked for namespace `users.1`. With the fix, only `users.1` and
    // anything strictly under `users.1.*` should match.
    const cb = vi.fn();
    events.subscribe("users.1", cb);
    events.subscribe("users.1.updated", cb);
    events.subscribe("users.10", cb);
    events.subscribe("users.100.updated", cb);

    const matches = events.getByNamespace("users.1");
    expect(Object.keys(matches).sort()).toEqual(
      ["users.1", "users.1.updated"].sort(),
    );

    events.unsubscribeNamespace("users.1");
    // The siblings must survive.
    expect(events.subscriptions("users.10").length).toBe(1);
    expect(events.subscriptions("users.100.updated").length).toBe(1);
    // The targeted namespace is gone.
    expect(events.subscriptions("users.1").length).toBe(0);
    expect(events.subscriptions("users.1.updated").length).toBe(0);
  });
});
