export default (start = 0, end = 1, integer) => {
  const range = end - start;
  const result = range * Math.random() + start;
  return integer ? Math.floor(result + 0.5) : result;
};