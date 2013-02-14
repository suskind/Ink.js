/**
 * Provides the base Widget class xx...
 *
 * @module Component.Slider.1
 */

Ink.createModule(
    'Component.Slider.1',
    ['Dom.Event.1', 'Dom.Css.1'],
    function(Event, Css) {

        /**
         * @class Ink.Component.Slider
         *
         * @constructor
         * @param {DOMElement}  el    blah blah
         * @param {Object}      opts  asdqefqwfq wfqw fq
         */
        var Comp = function(el, opts) {
            this._el = el;
            this._options = opts;

            Css.addClassName(this._el, 'bold');
            Event.observe(this._el, 'click', this.get);
        };

        Comp.prototype = {

            /**
             * @method get
             * @return {String} yoyoyo
             */
            get: function() {
                return 'TODO';
            }

        };

        return Comp;
    }
);
