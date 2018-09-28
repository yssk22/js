/* @flow */

const sortByFieldValue = (key: string, ascdesc: 'asc' | 'desc' = 'asc') => {
  return (a: any, b: any) => {
    if (a[key] < b[key]) {
      return ascdesc === 'asc' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return ascdesc === 'asc' ? 1 : -1;
    }
    return 0;
  };
};

export { sortByFieldValue };
