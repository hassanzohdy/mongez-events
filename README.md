# Mongez Events

From Wikipedia:

> In computer programming, event-driven programming is a programming paradigm in which the flow of the program is determined by events such as user actions (mouse clicks, key presses), sensor outputs, or message passing from other programs or threads. Event-driven programming is the dominant paradigm used in graphical user interfaces and other applications (e.g., JavaScript web applications) that are centered on performing certain actions in response to user input.

## Introduction

In a nutshell, the event driven approach is a powerful paradigm to handle data and actions based on the occurrence of certain events.

## Installation

Using Yarn

```bash
yarn add @mongez/events
```

npm

```bash
npm i @mongez/events
```

### Basic usage

The following example shows how events can be used.

```ts
import events from "@mongez/events";

// First add an event listener for some event, let's call it `numberChange`

events.subscribe("numberChange", (number) => {
  console.log(number); // 5
});

// later in anywhere in the application

events.trigger("numberChange", 5);
```

This is a simple usage of the event system, you may have seen it before if you've worked with jQuery or with the DOM Events in general.

## Event Subscription

The `on` method is called a subscription method that we subscribe our callback, in our case the callback that logged the number once the **numberChange** event is triggered.

You can subscribe to any event using one of the following methods: `on` | `addEventListener` or `subscribe`.

They are all interchangeable methods, but it's recommended to use `subscribe` method as it's more readable and also it is the base method for the other two methods.

```ts
import events from "@mongez/events";

// subscribe to the `numberChange` event
events.subscribe("numberChange", (number) => {
  console.log(number); // 5
});

// subscribe to the `numberChange` event
events.on("numberChange", (number) => {
  console.log(number); // 5
});

// subscribe to the `numberChange` event
events.addEventListener("numberChange", (number) => {
  console.log(number); // 5
});
```

## Unsubscribe to event

Any subscription to certain event generates an `EventSubscription` instance as a return type, this is useful if you need to cancel that subscription at anytime.

```ts
import events from "@mongez/events";

const headerSubscription = events.subscribe("headerChange", () => {
  console.log("Header has been changed");
});

// three seconds later
setTimeout(() => {
  headerSubscription.unsubscribe();
}, 3000);
```

The `EventSubscription` object has the following properties and methods

```ts
type EventSubscription = {
  /**
   * The callback function that will be triggered on the dispatch method
   */
  callback: Function;
  /**
   * Event name
   */
  event: string;
  /**
   * A method to trigger the callback function
   */
  dispatch: (...args: any[]) => any;
  /**
   * Remove the callback from the events list
   */
  unsubscribe: () => void;
};
```

## Event Trigger

As the event will have a listener/subscriber, it also needs to be triggered in certain point so the listener will know the event is fired.

You can trigger any event using `trigger` or `emit` methods and send any values in the 2nd or more arguments.

```ts
import events from "@mongez/events";

events.subscribe("cartUpdate", (cartData, mode) => {
  console.log(mode); // quantityChanged
});
```

Now let's trigger the event from somewhere else in the project.

```ts
const cartData = {
  totalQuantity: 10,
  totalPrice: 201,
  taxes: 200,
};

const mode = "quantityChanged";

events.trigger("cart.update", cartData, mode);
```

### Returning values from the trigger

If any listener return any value, the last return value from the listeners will be returned.

```ts
import events from "@mongez/events";

events.on("cart.update", (cartData) => {
  if (cartData.totalQuantity === 0) return "Empty Cart";
});

events.on("cart.update", (cartData) => {
  console.log(cartData.totalQuantity); // output: 0
});

let result = events.trigger("cart.update", {
  totalQuantity: 0,
  // ...other values
});

console.log(result); // Empty Cart
```

> Please be aware that returning false will stop calling other listeners, see next section.

### Stopping the event trigger from certain listener

If we want to just stop the loop from going to the next listeners, then returning `false` will stop the loop from going to the next listeners.

```ts
import events from "@mongez/events";

events.on("cart.update", (cartData) => {
  return false; // prevent going to next listener
});

events.on("cart.update", (cartData) => {
  console.log(cartData.totalQuantity); // this will not be triggered
});

let result = events.trigger("cart.update", {
  totalQuantity: 0,
});
```

## Removing Events

As we can subscribe to events, we may also need to clear all event subscriptions at once, this can be done by using `off` or `unsubscribe` method

```ts
import events from "@mongez/events";

// clear all event listeners to the `headerChange` and `footerChange` events
events.off("headerChange").off("footerChange");
```

You may also clear the entire events listeners by not passing any arguments to the `off` or to the `unsubscribe` method.

```ts
import events from "@mongez/events";

// clear all event listeners from the event loop
events.unsubscribe();
```

## Triggering all event listeners

As the `trigger` method can be stopped from a single listener to call the other listeners, there is another way to call all event listeners regardless the return of each listener by using the `triggerAll` method

```ts
import events from "@mongez/events";

events.on("cart.update", (cartData) => {
  return false; // this will not prevent going to next listener
});

events.on("cart.update", (cartData) => {
  console.log(cartData.totalQuantity); // this will be called as well output is: 1
});

events.triggerAll("cart.update", {
  totalQuantity: 1,
});
```

Another advantage of the `triggerAll` method is that it returns an instance of `EventTriggerResponse` that informs you the state of the trigger process, the event name, number of called listeners and its outputs.

```ts
type EventTriggerResponse = {
  /**
   * Event Name
   */
  event: string;
  /**
   * Number of triggered callbacks
   */
  length: number;
  /**
   * List of all returned values from each subscription callback, undefined values will not be included
   */
  results: any[];
};
```

## Removing events by namespace

In certain cases, we may need to remove all events that starts with certain namespace, for example we need to clear all events are related to the cart such as `cart.initialized` `cart.update` `cart.remove` `cart.reset` and so on.

So instead of removing each one separately, we can remove them all by using `unsubscribeNamespace` method.

```ts
import events from "@mongez/events";

events.on("cart.initialized", () => {
  console.log("Cart is initialized");
});

events.on("cart.update", (cartData) => {
  console.log("Cart is updated");
});

events.on("cart.remove", (cartItem) => {
  console.log(`Removed cart item ${cartItem.name}`);
});

// remove all cart listeners

events.unsubscribeNamespace("cart"); // all listeners will be cleared
```

## Get all event subscriptions

To get all subscriptions of certain event, you can use the `subscriptions` method.

```ts
import events from "@mongez/events";

events.on("headerChange", () => {
  console.log("Header has been changed");
});

events.on("headerChange", () => {
  console.log("Header has been changed again");
});

// get length of all subscriptions to the `headerChange` event
console.log(events.subscriptions("headerChange").length); // 2
```

## Tests

To run the tests, run the following command

```bash
yarn test
```

## Change Log

- V2.0.0 (01 Mar 2023)
  - Removed multiple events subscriptions and unsubscriptions.
  - Added Unit Tests.
  - Enhanced parameters and return types.

## TODO

- Add `triggerAsync` method to trigger events asynchronously.
- Add `triggerAllAsync` method to trigger all events asynchronously.
