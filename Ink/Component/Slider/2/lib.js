Ink.createModule(
    'Ink.Component.Slider', 2,
    ['Ink.Dom.Event_1', 'Ink.Dom.Css_1'],
    function(Event, Css) {

        var Comp = function(el, opts) {
            this._el = el;
            this._options = opts;

            Css.addClassName(this._el, 'italic');
            Event.observe(this._el, 'click', this.get);
        };

        Comp.prototype = {

            get: function() {
                return 'TODO 2';
            }

        };

        return Comp;
    }
);
