export const throttleEvent = (callback: EventListener, time: number = 50, immediate: 0 | 1 = 0): EventListener => {
  let timeout: number | NodeJS.Timer;

  return (event: Event): void => {
    if (!timeout) {
      if (immediate) {
        callback(event);
      }

      timeout = setTimeout(() => !(timeout = 0) && !immediate ? callback(event) : void 0, time);
    }
  };
};
