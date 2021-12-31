export type EventListenersList = {
  [eventName: string]: EventSubscription[];
};

export type EventSubscription = {
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

export type EventTriggerResponse = {
  /**
   * Event Name
   */
  event: string;
  /**
   * Number of triggered callbacks
   */
  length: number;
  /**
   * List of all returned values from callback, undefined values will not be included
   */
  results: any[];
};
