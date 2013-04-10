var fs     = require('fs'),
    assert = require('assert'),
    Mocha  = require('mocha'),
    XUnit2 = Mocha.reporters.XUnit2 = require('./serverUtils/xunit2');



global.ok = function(val, msg) {
    assert.ok(val, msg);
};
global.equal = function(actual, expected, msg) {
    assert.equal(actual, expected, msg);
};



var m = new Mocha({
    ui:       'qunit',
    reporter: XUnit2.bind(this, fs.createWriteStream('asdasd.xml', {encoding:'utf8'}), 'yo suite')
});



m.addFile('tests/flow/yahoo2.js');



/*var o = fs.createWriteStream(__dirname + '/out.xml');
process.__defineGetter__('stdout', function() { return o; });*/

var runner = m.run();

//console.log(runner.suite.toString());