/*globals equal,test*/
Ink.requireModules(['Ink.Util.Json'], function (Json) {
    'use strict';

    // We already know that the browser has a decent implementation of JSON.
    Json._nativeJSON = null;
    var nativeJSON = window.nativeJSON;
    var crockfordJSON = window.JSON;

    var s = function (asda) {return Json.get(asda, false)}

    test('Stringify primitive values', function () {
        equal(s(''), '""');
        equal(s('á'), '"á"');
        deepEqual(s(1), '1');
        equal(s(true), 'true');
        equal(s(false), 'false');
        equal(s(null), 'null');
        equal(s(NaN), 'null');
        equal(s(true), 'true');
        equal(s(false), 'false');
        equal(s(null), 'null');
        equal(s(NaN), 'null');
    });

    test('Serialize objects', function () {
        equal(s({a: 'c'}), '{"a": "c"}');
        equal(s({a: 'a'}), '{"a": "a"}');
        equal(s({d: 123, e: false, f: null, g: []}),
            '{"d": 123,"e": false,"f": null,"g": []}');
    });

    test('Serialize arrays', function () {
        equal(s([1, false, 1, 'CTHULHU']),
            '[1,false,1,"CTHULHU"]');
        equal(s([undefined, 1, {}]),
            '[1,false,1,"CTHULHU"]');
    });

    test('Nesting!', function () {
        equal(undefined, undefined);
    });

    test('Stringify large objects', function () {
        // hugeObject.js
        serialize(s, hugeObject, 'our JSON stuffs');
        serialize(nativeJSON.stringify, hugeObject, 'native JSON stuffs');
        serialize(crockfordJSON.stringify, hugeObject, 'crockford\'s JSON stuffs');
    });

    /*
    test('luis2 HUGE benchmark', function () {
        serialize(s, luis2, 'our JSON');
        serialize(nativeJSON.stringify, luis2, 'native JSON');
        serialize(crockfordJSON.stringify, luis2, 'crockfords JSON');
    });
    */

    function serialize(func, obj, name) {
        var start = new Date();
        var serialized = func(obj);
        ok(true, (new Date() - start) + 'ms with ' + name);
        
        var chk = eval('('+serialized+')');
        equal(nativeJSON.stringify(chk), nativeJSON.stringify(obj), name);
    }
});
