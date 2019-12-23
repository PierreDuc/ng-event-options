export const throttleEvent = (
  callback: EventListener,
  time: number = 50,
  immediate: 0 | 1 = 0
): EventListener => {
  let timeout: number;

  return (event: Event): void => {
    if (!timeout) {
      if (immediate) {
        callback(event);
      }

      timeout = window.setTimeout(
        () => {
          timeout = 0;
          return !immediate ? callback(event) : void 0;
        },
        time
      );
    }
  };
};
