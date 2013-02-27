Ink.createModule(
    'Ink.Namespace.ModuleName', // Full Module Name
    '1', // version 
    ['Ink.Dom.Event_1', 'Ink.Dom.Css_1'], // array of dependencies 
    function(Event, Css) {  // function module definition 

        var ModuleName = function(options) {
            this._init(options);
        };

        ModuleName.prototype = {
            _init: function() 
            {
                this._options = Ink.extendObj({
                    }, arguments[0] || {});
            },

            _debug: function() {}
        };

        return ModuleName;
    }
);
