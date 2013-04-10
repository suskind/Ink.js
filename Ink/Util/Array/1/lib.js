/**
 * @author inkdev AT sapo.pt
 */


/**
 * Utility functions to use with Arrays
 */
Ink.createModule('Ink.Util.Array', '1', [], function() {

'use strict';

var InkArray = {

    /**
     * @function {Boolean} ? checks if value exists in array
     * @param {Any} value
     * @param {Array} arr
     */
    inArray: function(value, arr) {
        if (typeof arr === 'object') {
            for (var i = 0, f = arr.length; i < f; ++i) {
                if (arr[i] === value) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * @function {Array|Boolean} ? sorts an array of object by an object property
     * @param {Array}  arr   array of objects to sort
     * @param {String} value property to sort by
     */
    sortMulti: function(arr, key) {
        if (typeof arr === 'undefined' || arr.constructor !== Array) { return false; }
        if (typeof key !== 'string') { return arr.sort(); }
        if (arr.length > 0) {
            if (typeof(arr[0][key]) === 'undefined') { return false; }
            arr.sort(function(a, b){
                var x = a[key];
                var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
        return arr;
    },

    /**
     * @function {Boolean|Number|Array} ? returns the associated key of an array value
     * @param {String} value
     * @param {Array} arr
     * @param {optional Boolean} param to set if want the key of the first found value
     * @return false if not exists | number if exists and 3rd input param is true | array if exists and 3rd input param is not set or it is !== true
     */
    keyValue: function(value, arr, first) {
        if (typeof value !== 'undefined' && typeof arr === 'object' && this.inArray(value, arr)) {
            var aKeys = [];
            for (var i = 0, f = arr.length; i < f; ++i) {
                if (arr[i] === value) {
                    if (typeof first !== 'undefined' && first === true) {
                        return i;
                    } else {
                        aKeys.push(i);
                    }
                }
            }
            return aKeys;
        }
        return false;
    },

    /**
     * @function {Boolean|Array} ? returns the array shuffled, false if the param is not an array
     * @param {Array} arr
     */
    shuffle: function(arr) {
        if (typeof(arr) !== 'undefined' && arr.constructor !== Array) { return false; }
        var total   = arr.length,
            tmp1    = false,
            rnd     = false;

        while (total--) {
            rnd        = Math.floor(Math.random() * (total + 1));
            tmp1       = arr[total];
            arr[total] = arr[rnd];
            arr[rnd]   = tmp1;
        }
        return arr;
    },

    /**
     * @function {Array} ? runs a functions through each of the elements of an array
     * @param {Array} arr
     * @param {Function} cb - the function recieves as arguments value, index and array
     */
    each: function(arr, cb) {
        /*if(arr.forEach) {
            arr.forEach(cb);
            return;
        }*/
        var arrCopy    = arr.slice(0),
            total      = arrCopy.length,
            iterations = Math.floor(total / 8),
            leftover   = total % 8,
            i          = 0;

        if (leftover > 0) { // Duff's device pattern
            do {
                cb(arrCopy[i++], i-1, arr);
            } while (--leftover > 0);
        }
        if (iterations === 0) { return arr; }
        do {
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
            cb(arrCopy[i++], i-1, arr);
        } while(--iterations > 0);

        return arr;
    },

    /**
     * code taken and adapated from:
     *     https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/some
     *
     *  some is a recent addition to the ECMA-262 standard;
     *      as such it may not be present in other implementations
     *      of the standard. You can work around this by inserting
     *      the following code at the beginning of your scripts,
     *      allowing use of some in implementations which do not
     *      natively support it. This algorithm is exactly the one
     *      specified in ECMA-262, 5th edition, assuming Object and
     *      TypeError have their original values and that fun.call
     *      evaluates to the original value of Function.prototype.call.
     *
     * @param  {Array}   arr        The array you walk to iterate through
     * @param  {Function} cb        The callback that will be called on the array's elements
     * @param  {optional Object}    context object of the callback function
     * @return {Boolean}            True if the callback returns true at any point, false otherwise
     */
    some: function(arr, cb, context){

        if (arr === null){
            throw new TypeError('First argument is invalid.');
        }

        var t = Object(arr);
        var len = t.length >>> 0;
        if (typeof cb !== "function"){ throw new TypeError('Second argument must be a function.'); }

        for (var i = 0; i < len; i++) {
            if (i in t && cb.call(context, t[i], i, t)){ return true; }
        }

        return false;
    },

    /**
     * @function {Array} ? Returns an array containing every item that is shared between the two given arrays
     * @param {Array} arr1
     * @param {Array} arr2
     */
    intersect: function(arr1, arr2) {
        if (!arr1 || !arr2 || arr1 instanceof Array === false || arr2 instanceof Array === false) {
            return [];
        }

        var shared = [];
        for (var i = 0, I = arr1.length; i<I; ++i) {
            for (var j = 0, J = arr2.length; j < J; ++j) {
                if (arr1[i] === arr2[j]) {
                    shared.push(arr1[i]);
                }
            }
        }

        return shared;
    },

    /**
     * @function {Array} ? Convert lists type to type array
     * @param {Array} arr
     */
    convert: function(arr) {
        return Array.prototype.slice.call(arr || [], 0);
    },

    /**
     * @function {Array} ? Insert value into the array on specified idx
     * @param {Array} arr
     * @param {Number} idx
     * @param {Any} value
     */
    insert: function(arr, idx, value) {
        arr.splice(idx, 0, value);
    },

    remove: function(arr, from, rLen){
        // return arr.slice(0, from).concat(arr.slice(to));
        // return arr.splice.apply(arr, [from, arr.length - to].concat(arr.slice(to)));

        var output = [];

        for(var i = 0, iLen = arr.length; i < iLen; i++){
            if(i >= from && i < from + rLen){
                continue;
            }

            output.push(arr[i]);
        }

        return output;
    }
};

return InkArray;

});


/*
 *  TODO - INCLUDE THIS ON Ink.Util.Array
 *
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(cb, thisArg) {
        var O, len, T, k, kValue;

        if (this === null || this === undefined) {
            throw new TypeError('this is null or not defined');
        }

        O = Object(this);
        len = O.length >>> 0;

        if ({}.toString.call(cb) !== '[object Function]') {
            throw new TypeError(cb + ' is not a function');
        }

        if (thisArg) {
            T = thisArg;
        }

        k = 0;

        while (k < len) {
            if (Object.prototype.hasOwnProperty.call(O, k)) {
                kValue = O[k];
                cb.call(T, kValue, k, O);
            }
            ++k;
        }
    };
}


// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/map
if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {
        var T, A, k;

        if (this === null || this === undefined) {
            new TypeError(" this is null or not defined");
        }

        var O = Object(this);
        var len = O.length >>> 0;

        if ({}.toString.call(callback) !== "[object Function]") {
            throw new TypeError(callback + " is not a function");
        }

        if (thisArg) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;

        while(k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[ k ];
                mappedValue = callback.call(T, kValue, k, O);
                A[ k ] = mappedValue;
            }
            ++k;
        }
        return A;
    };
}

*/
