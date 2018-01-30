export const debounceEvent = (callback: EventListener, time: number = 50, immediate: 0 | 1 = 0): EventListener => {
  let timeout: number | NodeJS.Timer;
  let wait: boolean;

  return (event: Event): void => {
    clearTimeout(timeout as number);
    timeout = setTimeout(() => immediate ? wait = false : callback(event), time);

    if (immediate && !wait) {
      wait = true;
      callback(event);
    }
  };
};
