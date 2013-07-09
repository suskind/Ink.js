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
     * @param {String} langCode language code of the target language
     * @param {Boolean} translationStringsInRoot indicates whether translation strings are in the root of langObject. This is turned off by default.
     */
    function I18n (langObject, langCode, translationStringsInRoot) {
        this._init(langObject, langCode, translationStringsInRoot);
    }

    I18n.prototype = {
        _init: function (langObject, langCode, translationStringsInRoot) {
            this._testMode = false;
            this._lang = langCode || 'pt_PT';
            this._strings = {};
            this.append(langObject, translationStringsInRoot);  // Add the translation strings
        },
        /**
         * Adds translation strings for this helper to use.
         *
         * @method append
         * @param {Object} baseLangObject object containing language objects identified by their language code
         * @param {Boolean} translationStringsInRoot indicates whether translation strings are in the root of langObject. This is turned off by default.
         */
        append: function (langObject, translationStringsInRoot) {
            var keys = langObject[this._lang];
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
         * Given a singular string, a plural string, and a number, returns
         * either the singular or plural string.
         *
         * If the function receives a list of ordinal suffixes and a number,
         * it returns the ordinal form of such number. See example below.
         *
         * @method ntext
         * @return {String}
         *
         * @param {String} strSin word to use when count is 1
         * @param {String} strPlur word to use otherwise
         * @param {Number} count number which defines which word to use
         *
         * @example
         *     Ink.Util.I18n.ntext('animal', 'animals', 0); // returns 'animals'
         *     Ink.Util.I18n.ntext('animal', 'animals', 1); // returns 'animal'
         *
         * @example
         *     var args = ['', 'st', 'nd', 'rd', 'th'];
         *     Ink.Util.I18n.ntext(args, 1);    // returns 'st'
         *     Ink.Util.I18n.ntext(args, 2);    // returns 'nd'
         *     Ink.Util.I18n.ntext(args, 3);    // returns 'rd'
         *     Ink.Util.I18n.ntext(args, 4);    // returns 'th'
         *     Ink.Util.I18n.ntext(args, 5);    // returns 'th'
         */
        ntext: function(strSin, strPlur, count) {  // TODO split into ntext and toOrdinal
            if (typeof strSin === 'string' && typeof strPlur === 'string' && typeof count === 'number') {
                if (count === 1) {
                    return strSin;
                } else {
                    return strPlur;
                }
            }
            else {
                var words = strSin;
                count = strPlur;

                var lastIndex = words.length - 1;

                if (count >= lastIndex) {
                    return words[lastIndex];
                } else {
                    return words[count];
                }
            }
        }
    };
    
    return I18n;
});
