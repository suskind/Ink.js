Ink.createModule(
    'Ink.Dom.Event', 1,
    [],
    function() {

        return {

            observe: function(el, ev, cb) {
                //console.log(['TODO: Dom.Event.observe(', el, ', ', ev, ', ', cb, ')'].join(''));
            },

            stopObserving: function(el, ev, cb) {
                //console.log(['TODO: Dom.Event.stopObserving(', el, ', ', ev, ', ', cb, ')'].join(''));
            }
        };
    }
);
