Ink.createModule(
    'Component.Gallery.1',
    ['Dom.Event.1', 'Dom.Css.1'],
    function(Event, Css) {

        // NOTICE THAT GALLERY ISN'T RETURING A CLASS CONSTRUCTOR BUT A SIMPLE FUNCTION
        return function(initialValue) {
            return {
                _value: initialValue || 0,

                getValue: function() { return this._value; },
                prev: function() { return --this._value; },
                next: function() { return ++this._value; }
            };
        };
        
    }
);
