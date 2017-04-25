export function isUndefined(x): boolean {
  return typeof x === 'undefined';
}

export function isNumber(x: any): boolean {
  return typeof x === 'number';
}

export function isObject(x: any): boolean {
  return typeof x === 'object';
}

export function getMedian(arr: number[]): number {
  arr = arr.sort();
  let len = arr.length;
  if (len % 2 === 0) {
    return (arr[len / 2 | 0] + arr[len / 2 | 0 - 1]) / 2;
  } else {
    return arr[len / 2 | 0];
  }
}
