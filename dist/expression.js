"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setByExpression = exports.getByExpression = void 0;
const utils_1 = require("./utils");
function parseExpression(exp) {
    const reg = /((\[\])|(\[\-\])|(\[\+\])|(\[\-\d*\])|(\[\d*\])|(\[\"[^\[\]\"]*\"\])|(\[\'[^\[\]\']*\'\])|([^\[\]\\.\?"]*))/gm;
    return (exp.match(reg) || []).filter(Boolean).map(i => (i.match(/\[[^\[\]]*\]/) ? i : `["${i}"]`));
}
function evalGetByExpression(object, expresionParts) {
    const expParts = [...expresionParts];
    const exp = expParts.shift();
    const currentValue = utils_1.safe(() => new Function('object', `return object${exp}`)(object), undefined);
    if (expParts.length) {
        let matchResult;
        if (expParts[0] === '[]' && Array.isArray(currentValue)) {
            return currentValue.map((item, index) => evalGetByExpression(currentValue, [`[${index}]`, ...expParts.slice(1)]));
        }
        else if (!!(matchResult = expParts[0].match(/(\[(\-\d*)\])/)) &&
            matchResult.length >= 3 &&
            !isNaN(matchResult[2]) &&
            Array.isArray(currentValue)) {
            return evalGetByExpression(currentValue, [`[${currentValue.length + parseInt(matchResult[2], 10)}]`, ...expParts.slice(1)]);
        }
        return evalGetByExpression(currentValue, expParts);
    }
    return currentValue;
}
function evalSetByExpression(object, expresionParts, value) {
    const expParts = [...expresionParts];
    const exp = expParts.shift();
    if (expParts.length) {
        let currentValue = utils_1.safe(() => new Function('object', `return object${exp === '[]' || exp === '[+]' ? '[0]' : exp || ''}`)(object), undefined);
        const nextShouldBeArray = !!(expParts[0] && expParts[0].match(/\[(([\-]?)|([\+]?)|(\d*))\]/));
        const isArray = Array.isArray(currentValue);
        if (nextShouldBeArray && !isArray) {
            currentValue = [];
            evalSetByExpression(object, [exp], currentValue);
        }
        else if (!nextShouldBeArray && (typeof currentValue !== 'object' || currentValue === null || isArray)) {
            currentValue = {};
            evalSetByExpression(object, [exp], currentValue);
        }
        if (expParts[0] === '[]' && currentValue.length && isArray) {
            currentValue.forEach((item, index) => evalSetByExpression(currentValue, [`[${index}]`, ...expParts.slice(1)], value));
        }
        else if (expParts[0] === '[+]' && currentValue.length && isArray) {
            evalSetByExpression(currentValue, [`[${currentValue.length}]`, ...expParts.slice(1)], value);
        }
        else if (expParts[0] === '[-]' && currentValue.length && isArray) {
            currentValue.unshift(undefined);
            evalSetByExpression(currentValue, [`[0]`, ...expParts.slice(1)], value);
        }
        else {
            evalSetByExpression(currentValue, expParts, value);
        }
    }
    else {
        utils_1.safe(() => new Function('object', 'value', `return object${exp.match(/([[\-\+]])/) ? '[0]' : exp || ''} = value`)(object, value), undefined);
    }
}
function getByExpression(object, exp) {
    const pts = parseExpression(exp);
    return utils_1.safe(() => evalGetByExpression(object, pts), undefined);
}
exports.getByExpression = getByExpression;
function setByExpression(object, exp, value) {
    const pts = parseExpression(exp);
    evalSetByExpression(object, ['', ...pts], value);
}
exports.setByExpression = setByExpression;
//# sourceMappingURL=expression.js.map