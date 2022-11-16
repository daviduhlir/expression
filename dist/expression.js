"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setByExpression = exports.getByExpression = void 0;
const utils_1 = require("./utils");
function parseExpression(exp) {
    const reg = /((\[\])|(\[\+\])|(\[\d*\])|(\[\"[^\[\]\"]*\"\])|(\[\'[^\[\]\']*\'\])|([^\[\]\\.\?"]*))/gm;
    return (exp.match(reg) || []).filter(Boolean).map(i => (i.match(/\[[^\[\]]*\]/) ? i : `["${i}"]`));
}
function simplifyAndSplit(expParts) {
    return expParts.reduce((acc, part) => {
        if (part === '[]') {
            acc.push('');
        }
        else {
            acc[acc.length - 1] += part;
        }
        return acc;
    }, ['']);
}
function evalGetByExpression(object, expresionParts) {
    const expParts = [...expresionParts];
    const exp = expParts.shift();
    const value = utils_1.safe(() => new Function('object', `return object${exp}`)(object), undefined);
    if (expParts.length) {
        if (Array.isArray(value)) {
            return value.map(item => evalGetByExpression(item, expParts));
        }
        return undefined;
    }
    return value;
}
function evalSetByExpression(object, expresionParts, value) {
    const expParts = [...expresionParts];
    const exp = expParts.shift();
    if (expParts.length) {
        let currentValue = utils_1.safe(() => new Function('object', `return object${exp === '[]' || exp === '[+]' ? '[0]' : exp || ''}`)(object), undefined);
        const nextShouldBeArray = !!(expParts[0] && expParts[0].match(/\[(([+]?)|(\d*))\]/));
        if (nextShouldBeArray && !Array.isArray(currentValue)) {
            currentValue = [];
            evalSetByExpression(object, [exp], currentValue);
        }
        else if (!nextShouldBeArray && (typeof currentValue !== 'object' || currentValue === null || Array.isArray(currentValue))) {
            currentValue = {};
            evalSetByExpression(object, [exp], currentValue);
        }
        if (expParts[0] === '[]' && currentValue.length) {
            currentValue.forEach((item, index) => evalSetByExpression(currentValue, [`[${index}]`, ...expParts.slice(1)], value));
        }
        else if (expParts[0] === '[+]' && currentValue.length) {
            evalSetByExpression(currentValue, [`[${currentValue.length}]`, ...expParts.slice(1)], value);
        }
        else {
            evalSetByExpression(currentValue, expParts, value);
        }
    }
    else {
        utils_1.safe(() => new Function('object', 'value', `return object${exp === '[]' || exp === '[+]' ? '[0]' : exp || ''} = value`)(object, value), undefined);
    }
}
function getByExpression(object, exp) {
    const pts = simplifyAndSplit(parseExpression(exp));
    return evalGetByExpression(object, pts);
}
exports.getByExpression = getByExpression;
function setByExpression(object, exp, value) {
    const pts = parseExpression(exp);
    evalSetByExpression(object, ['', ...pts], value);
}
exports.setByExpression = setByExpression;
//# sourceMappingURL=expression.js.map