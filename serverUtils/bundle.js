(function() {

    'use strict';

    /*jshint node:true */



    var fs       = require('fs'),
        async    = require('async'),
        myUtils  = require('./utils');


    var cfg = myUtils.loadJSON('./serverUtils/config.json');
    var files = myUtils.loadJSON('./serverUtils/moduleFiles.json');
    var filesToBundle;

    var op = process.argv[2];
    if (op && op === 'min') {

        // files -> minFiles
        filesToBundle = [];
        var file, minFile, i, f, l;
        for (i = 0, f = files.length; i < f; ++i) {
            file = files[i];
            l = file.length;
            minFile = [file.substring(0, l - 3), '.min.js'].join('');
            filesToBundle.push(minFile);
        }
    }
    else {
        filesToBundle = files;
    }
    //console.log(minFiles);



    // concatenate
    var ws = fs.createWriteStream( cfg.bundleFile );
    var left = filesToBundle.length;

    async.forEachSeries(
        filesToBundle,
        function(f, innerCb) {    // for each
            //ws.write('\n// ' + f + '\n'); // uncomment if you want to prefix each file with its comment
            ws.write('\n'); // one file per line
            --left;
            var rs = fs.createReadStream(f, {encoding: 'utf-8'});
            rs.on('end', innerCb);
            rs.pipe(ws, {end: left === 0});
        },
        function(err) { // on all done or error...
            console.log(err ? err : 'Created bundle on ' + cfg.bundleFile);
        }
    );

})();
