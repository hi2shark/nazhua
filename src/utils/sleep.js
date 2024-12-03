export default (timed = 1000) => new Promise((resolve) => {
  setTimeout(() => resolve(), timed > 0 ? timed : 30);
});
