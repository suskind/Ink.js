(function() {
    
    'use strict';

    /*jshint node:true */

    
    
    /* dependency modules */
    var ls      = require('./ls'),
        myUtils = require('./utils'),
        fs      = require('fs'),
        util    = require('util');
        


    var cfg = myUtils.loadJSON('serverUtils/config.json');



    var roots = cfg.roots;
    

    roots = roots.map(function(root) {
        return './' + root;
    });

    var isVersionsDir = function(dirs) {
        if (dirs.length === 0) { return false; }
        var ok = true;
        dirs.some(function(d) {
            if (isNaN(d)) { ok = false; return false; }
        });
        return ok;
    };

    var tempDirs = [];
    var dirs = [];
    var files = [];

    ls({
        path: '.',
        filterFn: function(o) {
            var p = o.path;
            if (p === '.' ||
                roots.indexOf(p) !== -1) { return true; }
            var found = false;
            roots.some(function(root) {
                if (p.indexOf(root + '/') === 0) { found = true; return false; }
            });
            return found;
        },
        onDir: function(o) {
            var parts = o.path.split('/');
            var l = parts.length;
            if (l > 2 && l < 5) {
                tempDirs.push(o);
            }
        },
        onFile: function(o) {
            if (o.name === 'lib.js') {
                files.push(o.path);
            }
        },
        onComplete: function(err, o) {
            tempDirs.forEach(function(dir) {
                if (isVersionsDir( Object.keys(dir.dirs) )) {
                    dirs.push(dir.path);
                }
            });

            myUtils.saveJSON('serverUtils/moduleDirs.json',  dirs);
            myUtils.saveJSON('serverUtils/moduleFiles.json', files);
        }
    });
    
})();
