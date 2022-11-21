import { safe } from './utils'

/**
 * Split expression to properties
 * Every property in output will be wraped by brackets []
 */
function parseExpression(exp: string) {
  // parse all parts of expression
  const reg = /((\[\])|(\[\-\])|(\[\+\])|(\[\-\d*\])|(\[\d*\])|(\[\"[^\[\]\"]*\"\])|(\[\'[^\[\]\']*\'\])|([^\[\]\\.\?"]*))/gm
  return (exp.match(reg) || []).filter(Boolean).map(i => (i.match(/\[[^\[\]]*\]/) ? i : `["${i}"]`))
}

/**
 * Execute get by expresion
 */
function evalGetByExpression(object: any, expresionParts: string[]) {
  const expParts = [...expresionParts]
  const exp = expParts.shift()
  const currentValue = safe(() => new Function('object', `return object${exp}`)(object), undefined)

  if (expParts.length) {
    let matchResult
    if (expParts[0] === '[]' && Array.isArray(currentValue)) {
      // for each
      return currentValue.map((item, index) => evalGetByExpression(currentValue, [`[${index}]`, ...expParts.slice(1)]))
    } else if (
      !!(matchResult = expParts[0].match(/(\[(\-\d*)\])/)) &&
      matchResult.length >= 3 &&
      !isNaN(matchResult[2]) &&
      Array.isArray(currentValue)
    ) {
      // for negative index
      return evalGetByExpression(currentValue, [`[${currentValue.length + parseInt(matchResult[2], 10)}]`, ...expParts.slice(1)])
    }
    // stndart
    return evalGetByExpression(currentValue, expParts)
  }

  return currentValue
}

/**
 * Execute set by expresion
 */
function evalSetByExpression(object: any, expresionParts: string[], value: any) {
  const expParts = [...expresionParts]
  const exp = expParts.shift()
  if (expParts.length) {
    let currentValue = safe(() => new Function('object', `return object${exp === '[]' || exp === '[+]' ? '[0]' : exp || ''}`)(object), undefined)
    const nextShouldBeArray = !!(expParts[0] && expParts[0].match(/\[(([\-]?)|([\+]?)|(\d*))\]/))

    const isArray = Array.isArray(currentValue)

    // complete missings
    if (nextShouldBeArray && !isArray) {
      currentValue = []
      evalSetByExpression(object, [exp], currentValue)
    } else if (!nextShouldBeArray && (typeof currentValue !== 'object' || currentValue === null || isArray)) {
      currentValue = {}
      evalSetByExpression(object, [exp], currentValue)
    }

    // sets value
    if (expParts[0] === '[]' && currentValue.length && isArray) {
      currentValue.forEach((item, index) => evalSetByExpression(currentValue, [`[${index}]`, ...expParts.slice(1)], value))
    } else if (expParts[0] === '[+]' && currentValue.length && isArray) {
      evalSetByExpression(currentValue, [`[${currentValue.length}]`, ...expParts.slice(1)], value)
    } else if (expParts[0] === '[-]' && currentValue.length && isArray) {
      currentValue.unshift(undefined)
      evalSetByExpression(currentValue, [`[0]`, ...expParts.slice(1)], value)
    } else {
      evalSetByExpression(currentValue, expParts, value)
    }
  } else {
    safe(() => new Function('object', 'value', `return object${exp.match(/([[\-\+]])/) ? '[0]' : exp || ''} = value`)(object, value), undefined)
  }
}

/**
 * Get value from object by expression (name seperated by "." or [])
 */
export function getByExpression(object: any, exp: string) {
  const pts = parseExpression(exp)
  return safe(() => evalGetByExpression(object, pts), undefined)
}

/**
 * Get value from object by expression (name seperated by "." or [])
 */
export function setByExpression(object: any, exp: string, value: any) {
  const pts = parseExpression(exp)
  evalSetByExpression(object, ['', ...pts], value)
}
