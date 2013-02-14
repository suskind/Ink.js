Ink.createModule(
    'Component.Slider.1',
    ['Dom.Event.1', 'Dom.Css.1'],
    function(Event, Css) {

        var Comp = function(el, opts) {
            this._el = el;
            this._options = opts;

            Css.addClassName(this._el, 'bold');
            Event.observe(this._el, 'click', this.get);
        };

        Comp.prototype = {

            get: function() {
                return 'TODO';
            }

        };

        return Comp;
    }
);
