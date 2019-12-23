export function getBitValue(...values: number[]): number {
  const len: number = values.length;
  let val: number = 0;

  for (let i = 0; i < len; i++) {
    val = val | values[ i ];
  }

  return val;
}
