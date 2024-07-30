// Helper function to unflatten the object
export const unflattenObject = (data) => {
  const result = {};

  for (let i in data) {
    const keys = i.split(/[\.\[\]]+/).filter(Boolean);
    keys.reduce((acc, key, idx) => {
      const isNextKeyArray = !isNaN(Number(keys[idx + 1]));

      if (idx === keys.length - 1) {
        acc[key] = data[i];
      } else {
        if (isNextKeyArray) {
          acc[key] = acc[key] || [];
        } else {
          acc[key] = acc[key] || {};
        }
      }

      return acc[key];
    }, result);
  }

  return result;
};
