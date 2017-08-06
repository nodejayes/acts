/**
 * implements some JS Methods to interact with Objects
 * @module ObjectHelper
 * @author Markus Gilg
 */
'use strict';

/**
 * merge two Object Properties with overwrite
 * @function objectCombine
 * @param {Object} target the Target Object 
 * @param {Object} source the Source Object
 * @return {Object} mergeresult
 */
const objectCombine = function (target, source) {
    for (const i in target) {
        if (target.hasOwnProperty(i) && source.hasOwnProperty(i)) {
            if (typeof target[i] === typeof {} && target[i] !== null) {
                objectCombine(target[i], source[i]);
            } else {
                target[i] = source[i];
            }
        }
    }
    for (const i in source) {
        if (!target.hasOwnProperty(i) && source.hasOwnProperty(i)) {
            target[i] = source[i];
        }
    }
};

class ObjectHelper {
    static objectCombine (target, source) {
        return objectCombine(target, source);
    }
}
module.exports = ObjectHelper;