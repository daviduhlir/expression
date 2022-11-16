"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatten = exports.safe = exports.replaceAll = void 0;
function replaceAll(input, search, replacement) {
    return input.replace(new RegExp(search, 'g'), replacement);
}
exports.replaceAll = replaceAll;
function safe(expression, defaultValue) {
    try {
        const value = expression();
        if (typeof value !== 'undefined') {
            return value;
        }
        else {
            return defaultValue;
        }
    }
    catch (e) {
        return defaultValue;
    }
}
exports.safe = safe;
function flatten(arr, depth = Infinity) {
    if (depth < 1) {
        return arr.slice();
    }
    return arr.reduce((acc, val) => (Array.isArray(val) ? acc.concat(flatten(val, depth - 1)) : acc.concat(val)), []);
}
exports.flatten = flatten;
//# sourceMappingURL=utils.js.map