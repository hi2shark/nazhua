/* eslint-disable */
export default () => {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  // Public Domain/MIT
  // Timestamp
  let d = new Date().getTime();
  // Time in microseconds since page-load or 0 if unsupported
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // random number between 0 and 16
    let r = Math.random() * 16;
    // Use timestamp until depleted
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}
