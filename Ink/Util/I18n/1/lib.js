/**
 * @module Ink.Util.I18n_1
 * @author inkdev AT sapo.pt
 * @version 1
 */

Ink.createModule('Ink.Util.I18n', '1', [], function () {
    'use strict';

    /**
     * Creates a new internationalization helper object
     *
     * @class Ink.Util.I18n
     * @constructor
     *
     * @param {Object} langObject object containing language objects identified by their language code
     * @param {String} [langCode='pt_PT'] language code of the target language
     * @param {Boolean} [translationStringsInRoot=false] indicates whether translation strings are in the root of langObject. This is turned off by default.
     */
    function I18n (langObject, langCode, translationStringsInRoot) {
        this._init(langObject, langCode, translationStringsInRoot);
    }

    I18n.prototype = {
        _init: function (langObject, langCode, translationStringsInRoot) {
            this._testMode = false;
            this._lang = langCode || 'pt_PT';
            this._strings = {};
            this.append(langObject || {}, translationStringsInRoot);  // Add the translation strings
        },
        /**
         * Adds translation strings for this helper to use.
         *
         * @method append
         * @param {Object} baseLangObject object containing language objects identified by their language code
         * @param {Boolean} translationStringsInRoot indicates whether translation strings are in the root of langObject. This is turned off by default.
         */
        append: function (langObject, translationStringsInRoot) {
            var keys = langObject[this._lang] || {};
            if (translationStringsInRoot) {
                keys = langObject;
            }
            Ink.extendObj(this._strings, keys);
        },
        /**
         * Get the language code
         *
         * @returns {String} the language code for this instance
         * @method {String} getLang
         */
        getLang: function () {return this._lang;},
        /**
         * Sets or unsets test mode. In test mode, unknown strings are wrapped
         * in `[ ... ]`. This is useful for debugging your application and
         * making sure all your translation keys are in place.
         *
         * @method testMode
         * @param {Boolean} toggle boolean value to set the test mode to.
         */
        testMode: function (toggle) {
            this._testMode = toggle || false;
        },
        /**
         * Returns an alias to `text()`. The resulting function is
         * traditionally assigned to "_".
         *
         * @method alias
         * @returns {Function} an alias to `text()`
         */
        alias: function () {
            var that = this;
            return function () {
                return I18n.prototype.text.apply(that, [].slice.call(arguments));
            };
        },
        /**
         * Given a translation key, return a translated string, with replaced parameters.
         * When a translated string is not available, the original string is returned unchanged.
         *
         * @method {String} text
         * @param {String} str key to look for in i18n dictionary (which is returned verbatim if unknown)
         * @param {optional String} arg1 replacement #1 (replaces first {%s} and all {%s:1})
         * @param {optional String} arg2 replacement #2 (replaces second {%s} and all {%s:2})
         * @param {optional String} argn... replacement #n (replaces nth {%s} and all {%s:n})
         *
         * @example
         *     _('Gosto muito de {%s} e o céu é {%s}.', 'carros', 'azul');
         *     // returns 'Gosto muito de carros e o céu é azul.'
         *
         * @example
         *     _('O {%s:1} é {%s:2} como {%s:2} é a cor do {%s:3}.', 'carro', 'azul', 'FCP');
         *     // returns 'O carro é azul como azul é o FCP.'
         */
        text: function (str /*, replacements...*/) {
            if (typeof str !== 'string') {return;} // Backwards-compat

            var original, res;
            if (!this._strings) {
                original = str;
            }
            else {
                res = this._strings[str];
                original = (typeof res === 'undefined') ? (this._testMode ? '[' + str + ']' : str) : res;
            }

            var re = false,
                i,
                l = arguments.length;

            if (l > 1) {
                for (i = 1; i < l; ++i) {
                    if (typeof arguments[i] !== 'undefined') {
                        re = new RegExp('{%s:' + i + '}', '');
                        if (re.test(original)) {
                            original = original.replace(re, arguments[i]);
                        }
                        else {
                            original = original.replace(/\{%s\}/, arguments[i]);
                        }
                        re = null;
                        re = false;
                    }
                }
            }
            original = original.replace(/\{%s(\:\d*)?\}/ig, '');

            return original;
        },
        /**
         * Given a singular string, a plural string, and a number, translates
         * either the singular or plural string.
         *
         * @method ntext
         * @return {String}
         *
         * @param {String} strSin word to use when count is 1
         * @param {String} strPlur word to use otherwise
         * @param {Number} count number which defines which word to use
         *
         * @example
         *     i18n.ntext('platypus', 'platypuses', 1); // returns 'ornitorrinco'
         *     i18n.ntext('platypus', 'platypuses', 2); // returns 'ornitorrincos'
         */
        ntext: function(strSin, strPlur, count) {
            if (count === 1) {
                return this.text(strSin);
            } else {
                return this.text(strPlur);
            }
        },
        /**
         * Returns the ordinal suffix of `num` (For example, 1 > 'st', 2 > 'nd', 5 > 'th', ...).
         *
         * This works by using transforms (in the form of Objects or Functions) passed into the
         * function or found in the special key `_ordinals` in the active language dictionary.
         *
         * @method ordinal
         *
         * @param {Number}          num             Input number
         * 
         * @param {Object}          [options={}]
         *
         *    Maps for translating. Each of these options' fallback is found in the current
         *    language's dictionary. The lookup order is the following:
         *   
         *        1. `exceptions`.
         *        2. `byLastDigit`
         *        3. `default`
         *   
         *    Each of these may be either an `Object` or a `Function`. If it's a function, it
         *    is called, and if the function returns a string, that is used. If it's an object,
         *    the property is looked up using `[...]`. If what is found is a string, it is used.
         *
         * @param {Object|Function} [options.byLastDigit={}]
         *    If the language requires the last digit to be considered, mappings of last digits
         *    to ordinal suffixes can be created here.
         *
         * @param {Object|Function} [options.exceptions={}]
         *    Map unique, special cases to their ordinal suffixes.
         *
         * @returns {String}        Ordinal suffix for `num`.
         *
         * @example
         *     var i18n = new I18n({
         *         fr: {  // 1er, 2e, 3e, 4e, ...
         *             _ordinal: {  // The _ordinals key is special.
         *                 default: "e", // Usually the suffix is "e" in french...
         *                 exceptions: {
         *                     1: "er"   // ... Except for the number one.
         *                 }
         *             }
         *         },
         *         en_US: {  // 1st, 2nd, 3rd, 4th, ..., 11th, 12th, ... 21st, 22nd...
         *             _ordinal: {
         *                 default: "th",// Usually the digit is "th" in english...
         *                 byLastDigit: {
         *                     1: "st",  // When the last digit is 1, use "th"...
         *                     2: "nd",  // When the last digit is 2, use "nd"...
         *                     3: "rd"   // When the last digit is 3, use "rd"...
         *                 },
         *                 exceptions: { // But these numbers are special
         *                     0: "",
         *                     11: "th",
         *                     12: "th",
         *                     13: "th"
         *                 }
         *             }
         *         }
         *     });
         *
         *     i18n.setLang('fr');
         *     i18n.ordinal(1);    // return 'er'
         *     i18n.ordinal(2);    // return 'e'
         *     i18n.ordinal(11);   // return 'e'
         *
         *     i18n.setLang('en');
         *     i18n.ordinal(1);    // returns 'st'
         *     i18n.ordinal(2);    // returns 'nd'
         *     i18n.ordinal(12);   // returns 'th'
         *     i18n.ordinal(22);   // returns 'nd'
         *     i18n.ordinal(3);    // returns 'rd'
         *     i18n.ordinal(4);    // returns 'th'
         *     i18n.ordinal(5);    // returns 'th'
         *      
         *     // Examples of passing in the options directly
         *     var ptOrdinals = {
         *         default: 'º'
         *     }
         *     var i18n2 = new I18n();
         *     i18n2.ordinal(1, ptOrdinals); // Returns 'º'
         *     i18n2.ordinal(4, ptOrdinals); // Returns 'º'
         *
         **/
        ordinal: function (num, options) {
            if (typeof num === 'undefined') {
                return '';
            }
            var numStr = num.toString();
            options = options || {};
            var fromDict = this._strings._ordinals || {};

            var inCaseOptionsIsAFunction = v(options, num) || v(fromDict, num);
            if (inCaseOptionsIsAFunction) {
                return inCaseOptionsIsAFunction;
            }

            function v(val, number) {
                number = typeof number === 'undefined' ? num : number;
                if (typeof val === 'undefined') {
                    return;
                } else if (typeof val === 'function') {
                    try {
                        var ret = val(number);
                        return typeof ret === 'string' ? ret : null;
                    } catch(e) {}
                } else if (typeof val === 'object') {
                    return val[number];
                } else if (typeof val === 'string') {
                    // Useful for the default option, or to define a global _ordinals rule for languages which don't need it.
                    return val;
                }
            }
            function lookup (obj) {
                return (
                    v(obj.exceptions, num) ||
                    v(obj.byLastDigit, +(numStr[numStr.length - 1])) ||
                    v(obj.default, num) ||
                    null);
            }
            return lookup(options) || lookup(fromDict) || '';
        }
    };
    
    return I18n;
});
