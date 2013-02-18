/**
 * Provides the base Widget class xx...
 *
 * @module Component.Slider.1
 */

Ink.createModule(
    'Ink.Component.Slider', 1,
    ['Ink.Dom.Event_1', 'Ink.Dom.Css_1'],
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
