(function() {

    'use strict';

    /*jshint node:true */



    var fs       = require('fs'),
        async    = require('async'),
        myUtils  = require('./utils');


    var cfg = myUtils.loadJSON('./serverUtils/config.json');
    var files = myUtils.loadJSON('./serverUtils/moduleFiles.json');
    var minFiles = [];



    // files to minFiles
    var file, minFile, i, f, l;
    for (i = 0, f = files.length; i < f; ++i) {
        file = files[i];
        l = file.length;
        minFile = [file.substring(0, l - 3), '.min.js'].join('');
        minFiles.push(minFile);
    }
    //console.log(minFiles);



    var ws = fs.createWriteStream( cfg.bundleFile );
    var left = minFiles.length;

    async.forEachSeries(
        minFiles,
        function(f, innerCb) {    // for each
            //ws.write('\n// ' + f + '\n');
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
