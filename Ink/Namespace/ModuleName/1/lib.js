/**
 * @author inkdev AT sapo.pt
 */

Ink.createModule(
    'Ink.Namespace.ModuleName', // Full Module Name
    '1', // version
    ['Ink.Dom.Event_1', 'Ink.Dom.Css_1'], // array of dependencies
    function(Event, Css) {  // function module definition
        /*jshint unused:false */

        'use strict';

        var ModuleName = function(options) {
            this._init(options);
        };

        ModuleName.prototype = {
            _init: function()
            {
                this._options = Ink.extendObj({
                        opt1: 'foo',
                        opt2: 'bar'
                    }, arguments[0] || {});

                this._stuff = false;

                this._privMethod1();
            },

            _privMethod1: function()
            {
                this._stuff = this._options.opt1;
            },

            _privMethod2: function()
            {
                return this._stuff;
            },

            publicAPIMethod: function()
            {
                return this._privMethod2();
            },

            _debug: function() {}
        };

        return ModuleName;
    }
);

/* OR */

Ink.createModule(
        'Ink.Namespace.ModuleName',
        '2',
        [],
        function() {

    'use strict';

    var ModuleName = {
        _privMethod: function()
        {
            return 'foo';
        },

        publicMethod: function()
        {
            return this._privMethod();
        }
    };

    return ModuleName;

});
