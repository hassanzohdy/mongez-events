import events from "../src";

describe("Event Trigger All", () => {
  afterEach(() => {
    events.off("test");
  });

  it("should trigger all event listeners even if one returns false", () => {
    const callback = jest.fn(() => false);
    const callback2 = jest.fn(() => true);
    events.subscribe("test", callback);
    events.subscribe("test", callback2);
    events.triggerAll("test");

    expect(callback).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it("should return an object with the event name, length of results, and results", () => {
    const callback = jest.fn(() => false);
    const callback2 = jest.fn(() => true);
    events.subscribe("test", callback);
    events.subscribe("test", callback2);
    const result = events.triggerAll("test");

    expect(result).toEqual({
      event: "test",
      length: 2,
      results: [false, true],
    });
  });
});
