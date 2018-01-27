export const debounceEvent = (callback: EventListener, time?: number, immediate: 0 | 1 = 0): EventListener => {
  let timeout: number | NodeJS.Timer;
  time = Math.max(time || 0, 0);

  return (event: Event): void => {
    const callNow: boolean = !!immediate && !timeout;
    clearTimeout(timeout as number);
    timeout = setTimeout(() => {
      if (!callNow) {
        callback(event);
      }
      timeout = immediate ? setTimeout(() => timeout = 0, time) : 0;
    }, time);
    if (callNow) {
      callback(event);
    }
  };
};
