export const debounceEvent = (callback: EventListener, time: number = 50, immediate: 0 | 1 = 0): EventListener => {
  let timeout: number;
  let wait: boolean;

  return (event: Event): void => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => immediate ? wait = false : callback(event), time);

    if (immediate && !wait) {
      wait = true;
      callback(event);
    }
  };
};
