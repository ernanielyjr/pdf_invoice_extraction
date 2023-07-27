export function round(num: number, precision: number = 2) {
  const base = Math.pow(10, precision);
  return Math.round(num * base) / base;
}
