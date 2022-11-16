import { safe } from './utils'

/**
 * Split expression to properties
 * Every property in output will be wraped by brackets []
 */
function parseExpression(exp: string) {
  // parse all parts of expression
  const reg = /((\[\])|(\[\+\])|(\[\d*\])|(\[\"[^\[\]\"]*\"\])|(\[\'[^\[\]\']*\'\])|([^\[\]\\.\?"]*))/gm
  return (exp.match(reg) || []).filter(Boolean).map(i => (i.match(/\[[^\[\]]*\]/) ? i : `["${i}"]`))
}

/**
 * This will concat parts again, until [] will be found
 */
function simplifyAndSplit(expParts: string[]) {
  return expParts.reduce(
    (acc, part) => {
      if (part === '[]') {
        acc.push('')
      } else {
        acc[acc.length - 1] += part
      }
      return acc
    },
    [''],
  )
}

/**
 * Execute get by expresion
 */
function evalGetByExpression(object: any, expresionParts: string[]) {
  const expParts = [...expresionParts]
  const exp = expParts.shift()
  const value = safe(() => new Function('object', `return object${exp}`)(object), undefined)
  if (expParts.length) {
    if (Array.isArray(value)) {
      return value.map(item => evalGetByExpression(item, expParts))
    }
    return undefined
  }
  return value
}

/**
 * Execute set by expresion
 */
function evalSetByExpression(object: any, expresionParts: string[], value: any) {
  const expParts = [...expresionParts]
  const exp = expParts.shift()
  if (expParts.length) {
    let currentValue = safe(() => new Function('object', `return object${exp}`)(object), undefined)
    const nextShouldBeArray = !!(expParts[0] && expParts[0].match(/\[(([+]?)|(\d*))\]/))

    if (nextShouldBeArray && !Array.isArray(currentValue)) {
      currentValue = []
      evalSetByExpression(object, [exp], currentValue)
    } else if (!nextShouldBeArray && (typeof currentValue !== 'object' || currentValue === null || Array.isArray(currentValue))) {
      currentValue = {}
      evalSetByExpression(object, [exp], currentValue)
    }

    // if its empty bracket
    if (expParts[0] === '[]' && currentValue.length) {
      currentValue.map(item => evalSetByExpression(item, expParts.slice(1), value))
    } else if (expParts[0] === '[+]' && currentValue.length) {
      evalSetByExpression(currentValue, [`[${currentValue.length}]`, ...expParts.slice(1)], value)
    } else {
      evalSetByExpression(currentValue, expParts, value)
    }
  } else {
    safe(() => new Function('object', 'value', `return object${exp === '[]' ? '[0]' : exp} = value`)(object, value), undefined)
  }
}

/**
 * Get value from object by expression (name seperated by "." or [])
 */
export function getByExpression(object: any, exp: string) {
  const pts = simplifyAndSplit(parseExpression(exp))
  return evalGetByExpression(object, pts)
}

/**
 * Get value from object by expression (name seperated by "." or [])
 */
export function setByExpression(object: any, exp: string, value: any) {
  const pts = parseExpression(exp)
  evalSetByExpression(object, pts, value)
}
