import { replaceAll, safe, flatten } from './utils'

/**
 * Prepare string expression
 * Converts all literal parts to brackets style assign
 */
function prepareExpression(exp: string): string {
  const cleanExp = replaceAll(exp, '\\?\\.', '')
  const reg = /(\[\'([^\[\]\"]+)\'\]|\[\"([^\[\]\"]+)\"\]|\[([^\.\[\]\"]+)\]|([^\.\[\]\"]+))/g
  const out: string[] = []
  let match: RegExpExecArray | null = null
  while ((match = reg.exec(cleanExp)) !== null) {
    for (let i = 5; i > 0; i--) {
      if (match[i]) {
        out.push(match[i])
        break
      }
    }
  }
  return out.map(t => '["' + t + '"]').join('')
}

/**
 * Prepare expression depends on current data in object,
 * in this case, its checking for empty brackets, and if we found,
 * we are targeting non existing array with it, we will create array. In oposite way
 * if we found array, we will push it on the end of it
 */
function prepareExpressionDependsOnData(object: any, exp: string) {
  const arrayParts = exp.split('[]')
  return arrayParts
    .reduce<string[]>((acc, part, i) => {
      acc.push(part)
      if (i < arrayParts.length - 1) {
        const preparedCurrentExp = prepareExpression(acc.join('[]'))
        const currentPartValue = getByExpression(object, preparedCurrentExp)
        if (!Array.isArray(currentPartValue)) {
          acc.push('[0]')
        } else {
          acc.push(`[${currentPartValue.length}]`)
        }
      }
      return acc
    }, [])
    .join('')
}

/**
 * Try to parse number from anything
 */
function getNumberFromAny(value: any): number | null {
  const val = parseInt(value, 10)
  if (isNaN(val) || val.toString().length !== value.toString().length) {
    return null
  }
  return val
}

/**
 * Add missings objects and arrays
 */
function addMissings(object: any, exp: string) {
  const parts = replaceAll(exp, '"', '')
    .split(/\[([^\[\]]*)\]/)
    .filter(part => part.length)
  let pointer = object
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof pointer[parts[i]] === 'undefined' || pointer[parts[i]] === null) {
      const numberIndexNext = getNumberFromAny(parts[i + 1])
      if (numberIndexNext === null) {
        pointer[parts[i]] = {}
      } else {
        pointer[parts[i]] = []
      }
    }
    pointer = pointer[parts[i]]
  }
}

/**
 * Get all posible variants by empty []
 * @param object
 * @param exps
 * @returns
 */
function getArrayResultByExpression(object: any, exps: string[]) {
  if (exps.length === 1) {
    return getByExpression(object, exps[0])
  }

  const preparedExp = prepareExpression(exps[0])
  return getByExpression(object, preparedExp).map(value => getArrayResultByExpression(value, exps.slice(1)))
}

/**
 * Get value from object by expression (name seperated by "." or [])
 */
export function getByExpression(object: any, exp: string) {
  const arrayParts = exp.split('[]')

  if (arrayParts.length === 1) {
    const preparedExp = prepareExpression(exp)
    return safe(() => new Function('object', `return object${preparedExp}`)(object), undefined)
  } else {
    return flatten(getArrayResultByExpression(object, arrayParts), exp.endsWith('[]') ? arrayParts.length - 1 : arrayParts.length - 2)
  }
}

/**
 * Set value to object by expression (name seperated by ".")
 * @param object
 * @param exp
 */
export function setByExpression(object: any, exp: string, value: any) {
  const preparedExp = prepareExpression(prepareExpressionDependsOnData(object, exp))
  addMissings(object, preparedExp)
  return safe(() => new Function('object', 'value', `return object${preparedExp} = value`)(object, value), undefined)
}

/**
 * Get first property from expression
 * @param expression
 */
export function getFirstProperty(expression: string): string {
  return expression.split('.')[0].split('[')[0]
}
