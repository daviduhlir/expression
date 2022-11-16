"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstProperty = exports.setByExpression = exports.getByExpression = void 0;
const utils_1 = require("./utils");
function prepareExpression(exp) {
    const cleanExp = utils_1.replaceAll(exp, '\\?\\.', '');
    const reg = /(\[\'([^\[\]\"]+)\'\]|\[\"([^\[\]\"]+)\"\]|\[([^\.\[\]\"]+)\]|([^\.\[\]\"]+))/g;
    const out = [];
    let match = null;
    while ((match = reg.exec(cleanExp)) !== null) {
        for (let i = 5; i > 0; i--) {
            if (match[i]) {
                out.push(match[i]);
                break;
            }
        }
    }
    return out.map(t => '["' + t + '"]').join('');
}
function prepareExpressionDependsOnData(object, exp) {
    const arrayParts = exp.split('[]');
    return arrayParts
        .reduce((acc, part, i) => {
        acc.push(part);
        if (i < arrayParts.length - 1) {
            const preparedCurrentExp = prepareExpression(acc.join('[]'));
            const currentPartValue = getByExpression(object, preparedCurrentExp);
            if (!Array.isArray(currentPartValue)) {
                acc.push('[0]');
            }
            else {
                acc.push(`[${currentPartValue.length}]`);
            }
        }
        return acc;
    }, [])
        .join('');
}
function getNumberFromAny(value) {
    const val = parseInt(value, 10);
    if (isNaN(val) || val.toString().length !== value.toString().length) {
        return null;
    }
    return val;
}
function addMissings(object, exp) {
    const parts = utils_1.replaceAll(exp, '"', '')
        .split(/\[([^\[\]]*)\]/)
        .filter(part => part.length);
    let pointer = object;
    for (let i = 0; i < parts.length - 1; i++) {
        if (typeof pointer[parts[i]] === 'undefined' || pointer[parts[i]] === null) {
            const numberIndexNext = getNumberFromAny(parts[i + 1]);
            if (numberIndexNext === null) {
                pointer[parts[i]] = {};
            }
            else {
                pointer[parts[i]] = [];
            }
        }
        pointer = pointer[parts[i]];
    }
}
function getArrayResultByExpression(object, exps) {
    if (exps.length === 1) {
        return getByExpression(object, exps[0]);
    }
    const preparedExp = prepareExpression(exps[0]);
    return getByExpression(object, preparedExp).map(value => getArrayResultByExpression(value, exps.slice(1)));
}
function getByExpression(object, exp) {
    const arrayParts = exp.split('[]');
    if (arrayParts.length === 1) {
        const preparedExp = prepareExpression(exp);
        return utils_1.safe(() => new Function('object', `return object${preparedExp}`)(object), undefined);
    }
    else {
        return utils_1.flatten(getArrayResultByExpression(object, arrayParts), exp.endsWith('[]') ? arrayParts.length - 1 : arrayParts.length - 2);
    }
}
exports.getByExpression = getByExpression;
function setByExpression(object, exp, value) {
    const preparedExp = prepareExpression(prepareExpressionDependsOnData(object, exp));
    addMissings(object, preparedExp);
    return utils_1.safe(() => new Function('object', 'value', `return object${preparedExp} = value`)(object, value), undefined);
}
exports.setByExpression = setByExpression;
function getFirstProperty(expression) {
    return expression.split('.')[0].split('[')[0];
}
exports.getFirstProperty = getFirstProperty;
//# sourceMappingURL=expression.js.map