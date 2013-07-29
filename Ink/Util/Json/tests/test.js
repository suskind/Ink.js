/*globals equal,test*/
Ink.requireModules(['Ink.Util.Json'], function (Json) {
    'use strict';

    // We already know that the browser has a decent implementation of JSON.
    Json._nativeJSON = null;
    var nativeJSON = window.nativeJSON;
    var crockfordJSON = window.JSON;

    var s = function (asda) {return Json.get(asda, false)}

    function JSONEqual(a, b, msg) {
        deepEqual(eval('(' + a + ')'), b, msg)
    }

    test('Stringify primitive values', function () {
        equal(s(''), '""');
        equal(s('á'), '"á"');
        deepEqual(s(1), '1');
        equal(s(true), 'true');
        equal(s(false), 'false');
        equal(s(null), 'null');
        equal(s(NaN), 'null');
        equal(s(Infinity), 'null');
        equal(s(-Infinity), 'null');
        
        var arr = ['', 'á', 1, true, false, null, NaN, Infinity, -Infinity];
        JSONEqual(s(arr), arr);
        var obj = {1: '', 2: 'á', 3: true, 4: false, 5: null, 6: Infinity, 7: -Infinity};
        JSONEqual(s(obj), obj);
    });

    test('Serialize objects', function () {
        JSONEqual(s({a: 'c'}), {"a": "c"});
        JSONEqual(s({a: 'a'}), {"a": "a"});
        JSONEqual(s({d: 123, e: false, f: null, g: []}),
            {"d": 123,"e": false,"f": null,"g": []});
        JSONEqual(s({1: 2}), {1: 2});
    });

    test('Serialize arrays', function () {
        JSONEqual(s([1, false, 1, 'CTHULHU']),
            [1,false,1,"CTHULHU"]);
        JSONEqual(s([undefined, 1, {}]),
            [null, 1, {}]);
    });

    test('Nesting!', function () {
        var nested = [
            {
                cthulhu: ['fthagn']
            },
            "r'lyeh",
            123
        ];
        JSONEqual(s(nested), nested);
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
