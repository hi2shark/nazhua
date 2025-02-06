const BASE_Z_INDEX = 1000;
let zIndexCounter = BASE_Z_INDEX;

export const getNextZIndex = () => {
  zIndexCounter += 1;
  return zIndexCounter;
};

export const getCurrentZIndex = () => zIndexCounter;

export const resetZIndex = () => {
  zIndexCounter = BASE_Z_INDEX;
};
