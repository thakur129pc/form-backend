// Helper function to unflatten the object
export const unflattenObject = (data) => {
  const result = {};
  for (let i in data) {
    const keys = i.split(".");
    keys.reduce((acc, key, idx) => {
      return (
        acc[key] ||
        (acc[key] = isNaN(Number(keys[idx + 1]))
          ? keys.length - 1 === idx
            ? data[i]
            : {}
          : [])
      );
    }, result);
  }
  return result;
};
