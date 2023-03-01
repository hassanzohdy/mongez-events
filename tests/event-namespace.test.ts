import events from "../src";

describe("Event Namespace", () => {
  beforeEach(() => {
    events.unsubscribe();
  });

  it("should return all events in array of objects using namespace", () => {
    const callback = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    events.subscribe("namespaceTest", callback);
    events.subscribe("test2", callback2);
    events.subscribe("namespaceTest.test", callback3);

    const results = events.getByNamespaceArray("namespaceTest");

    expect(results.length).toEqual(2);
  });

  it("should return all events in object using namespace", () => {
    const callback = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn();

    events.subscribe("namespaceTest", callback);
    events.subscribe("test2", callback2);
    events.subscribe("namespaceTest.test", callback3);
    events.subscribe("namespaceTest.test", callback4);

    const results = events.getByNamespace("namespaceTest");

    expect(results.namespaceTest.length).toEqual(1);
    expect(results["namespaceTest.test"].length).toEqual(2);
  });
});
