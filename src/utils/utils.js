export const isEmpty = value =>
  value === undefined ||
  value === null ||
  value === 0 ||
  (typeof value === 'object' && Object.keys(value).length === 0) ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'string' && value.trim().length === 0) ||
  (typeof value === 'string' && value === 'null');

export const convertKeysToLowerCase = data => {
  let key,
    keys = Object.keys(data);
  let n = keys.length;
  let lowercasedKeysData = {};
  while (n--) {
    key = keys[n];
    lowercasedKeysData[key.toLowerCase()] = data[key];
  }
  return lowercasedKeysData;
};

export const createModel = (product, quantity) => {
  if (!isEmpty(product.packs)) {
    let variables = {};
    let ints = {};
    for (let p = 0; p < product.packs.length; p++) {
      const item = product.packs[p];
      const pack = {
        quantity: item.quantity,
        cost: item.cost
      };
      let name = `pack${item.quantity}`;
      variables = {
        ...variables,
        [name]: pack
      };
      ints = {
        ...ints,
        [name]: 1
      };
    }
    const model = {
      optimize: 'cost',
      opType: 'min',
      constraints: {
        cost: { min: 0 },
        quantity: { equal: quantity }
      },
      variables: variables,
      ints: ints
    };
    return model;
  }
};
