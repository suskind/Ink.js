(function() {

    'use strict';

    /*jshint node:true */



    /* dependency modules */
    var ls      = require('./ls'),
        myUtils = require('./utils'),
        fs      = require('fs'),
        util    = require('util');



    var paths = [];

    ls({
        path: './tests/',
        onFile: function(o) {
            var name = o.name;
            if (name.lastIndexOf('.xml') === -1) { return; }
            paths.push(o.path);
        },
        onComplete: function(err, o) {
            //console.log(paths);
            paths.forEach(function(path) {
                fs.unlink(path);
                console.log('- ' + path);
            });
            console.log('DONE');
        }
    });

})();
