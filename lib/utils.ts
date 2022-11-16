/**
 * Safe function call
 */
export function safe<T>(expression: () => T, defaultValue: any) {
  try {
    const value = expression()
    if (typeof value !== 'undefined') {
      return value
    } else {
      return defaultValue
    }
  } catch (e) {
    return defaultValue
  }
}

/**
 * Flatten array to one dimensional array
 */
export function flatten(arr: any[], depth: number = Infinity) {
  if (depth < 1) {
    return arr.slice()
  }

  return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flatten(val, depth - 1)) : acc.concat(val)), [])
}
