export const throttleEvent = (callback: EventListener, time?: number, immediate: 0 | 1 = 0): EventListener => {
  let timeout: number | NodeJS.Timer | undefined;
  time = Math.max(time || 0, 0);

  return (event: Event): void => {
    const callNow: boolean = !!immediate && !timeout;

    if (!timeout || immediate) {
      timeout = setTimeout(() => {
        callback(event);
        timeout = immediate ? setTimeout(() => timeout = 0, time) : 0;
      }, time);
      if (callNow) {
        callback(event);
      }
    }
  };
};
