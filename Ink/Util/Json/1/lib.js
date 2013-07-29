/**
 * @module Ink.Util.Json_1
 *
 * @author inkdev AT sapo.pt
 */

Ink.createModule('Ink.Util.Json', '1', [], function() {
    'use strict';

    var function_call = Function.prototype.call;

    function twoDigits(n) {
        var r = '' + n;
        if (r.length === 1) {
            return '0' + r;
        } else {
            return r;
        }
    }

    var date_toISOString = Date.prototype.toISOString ?
        Ink.bind(function_call, Date.prototype.toISOString) :
        function(date) {
            // Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
            return date.getUTCFullYear()
                + '-' + twoDigits( date.getUTCMonth() + 1 )
                + '-' + twoDigits( date.getUTCDate() )
                + 'T' + twoDigits( date.getUTCHours() )
                + ':' + twoDigits( date.getUTCMinutes() )
                + ':' + twoDigits( date.getUTCSeconds() )
                + '.' + String( (date.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
                + 'Z';
        };

    /**
     * @class Ink.Util.Json
     * @static
     * 
     * @example
     *      var obj = {
     *          key1: 'value1',
     *          key2: 'value2',
     *          keyArray: ['arrayValue1', 'arrayValue2', 'arrayValue3']
     *      }
     *      
     *      Json.stringify(obj);
     */
    var InkJson = {
        _nativeJSON: window.JSON || null,

        _convertToUnicode: false,

        // A character conversion map
        _toUnicode: function (theString)
        {
            if(!this._convertToUnicode) {

                var _m = { '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"',  '\\': '\\\\' };

                if (/["\\\x00-\x1f]/.test(theString)) {
                    theString = theString.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = _m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                    });
                }
                return theString;

            } else {
                var unicodeString = '';
                var inInt = false;
                var theUnicode = false;
                var i = 0;
                var total = theString.length;
                while(i < total) {
                    inInt = theString.charCodeAt(i);
                    if( (inInt >= 32 && inInt <= 126) ||
                            //(inInt >= 48 && inInt <= 57) ||
                            //(inInt >= 65 && inInt <= 90) ||
                            //(inInt >= 97 && inInt <= 122) ||
                            inInt === 8 ||
                            inInt === 9 ||
                            inInt === 10 ||
                            inInt === 12 ||
                            inInt === 13 ||
                            inInt === 32 ||
                            inInt === 34 ||
                            inInt === 47 ||
                            inInt === 58 ||
                            inInt === 92) {

                        if(inInt === 34 || inInt === 92 || inInt === 47) {
                            theUnicode = '\\'+theString.charAt(i);
                        } else if(inInt === 8) {
                            theUnicode = '\\b';
                        } else if(inInt === 9) {
                            theUnicode = '\\t';
                        } else if(inInt === 10) {
                            theUnicode = '\\n';
                        } else if(inInt === 12) {
                            theUnicode = '\\f';
                        } else if(inInt === 13) {
                            theUnicode = '\\r';
                        } else {
                            theUnicode = theString.charAt(i);
                        }
                    } else {
                        if(this._convertToUnicode) {
                            theUnicode = theString.charCodeAt(i).toString(16)+''.toUpperCase();
                            while (theUnicode.length < 4) {
                                theUnicode = '0' + theUnicode;
                            }
                            theUnicode = '\\u' + theUnicode;
                        } else {
                            theUnicode = theString.charAt(i);
                        }
                    }
                    unicodeString += theUnicode;

                    i++;
                }

                return unicodeString;
            }

        },

        _parseValue: function(param) {
            if (typeof param === 'string') {
                return '"' + this._toUnicode(param) + '"';
            } else if (typeof param === 'number' && (isNaN(param) || !isFinite(param))) {  // Odd numbers go null
                return 'null';
            } else if (typeof param === 'undefined' || param === null) {  // And so does undefined
                return 'null';
            } else if (typeof param === 'number' || typeof param === 'boolean') {  // These ones' toString methods return valid JSON.
                return '' + param;
            } else if (typeof param === 'function') {
                return 'null';  // match JSON.stringify
            } else if (param.constructor === Date) {
                return '"' + date_toISOString(param) + '"';
            } else if (param.constructor === Array) {
                var arrayString = '';
                for (var i = 0, len = param.length; i < len; i++) {
                    if (i > 0) {
                        arrayString += ',';
                    }
                    arrayString += this._parseValue(param[i]);
                }
                return '[' + arrayString + ']';
            } else {  // Object
                var objectString = '';
                for (var k in param)  {
                    if (param.hasOwnProperty(k)) {
                        if (objectString !== '') {
                            objectString += ',';
                        }
                        objectString += '"' + k + '": ' + this._parseValue(param[k]);
                    }
                }
                return '{' + objectString + '}';
            }
        },

        /**
         * @function {String} ? serializes a JSON object into a string
         * @param {Object} jsObject - JSON object
         * @param {Boolean} convertToUnicode - if true, converts the string contents of the object to unicode
         * @return serialized string
         */
        stringify: function(jsObject, convertToUnicode) {
            if(typeof(convertToUnicode) !== 'undefined') {
                if(convertToUnicode === false) {
                    this._convertToUnicode = false;
                } else {
                    this._convertToUnicode = true;
                }
            }
            if(!this._convertToUnicode && this._nativeJSON) {
                return this._nativeJSON.stringify(jsObject);
            }
            return this._parseValue(jsObject);
        }
    };

    return InkJson;
});
