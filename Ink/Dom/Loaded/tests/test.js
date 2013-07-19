/*globals equal,test,start,stop,expect*/
Ink.requireModules(['Ink.Dom.Loaded_1'], function (Loaded) {
    test('several Loaded callbacks called in order', function () {
        stop();
        expect(3);  // 3 assertions
        var i = 0;
        Loaded.run(function () {
            equal(++i, 1);
        });
        Loaded.run(function () {
            equal(++i, 2);
        });
        setTimeout(function () {
            Loaded.run(function () {
                equal(++i, 3);
                start();
            });
        }, 50);
    });
    test('Several contexts', function () {
        stop();
        expect(2);
        var iframe = document.createElement('iframe');
        iframe.src = 'iframe.html';
        document.getElementsByTagName('body')[0].appendChild(iframe);
        var iframeWindow = iframe.contentWindow;
        Loaded.run(iframeWindow, function () {
            var that = this;
            setTimeout(function () {
                equal(that, iframeWindow); 
            }, 50);
        });
        Loaded.run(window, function () {
            var that = this;
            setTimeout(function () {
                equal(that, window);
            }, 0);
        });
        setTimeout(start, 100);
    });
    test('Nested calls', function () {
        stop();
        expect(3);
        var i = 0;
        Loaded.run(function () {
            equal(++i, 1);
            Loaded.run(function () {
                equal(++i, 2);
                Loaded.run(function () {
                    equal(++i, 3);
                    start();
                });
            });
        });
    });
    test('When document is loaded, still wait for next tick', function () {
        stop();
        expect(2);
        var i = 0;
        Loaded.run(function () {
            equal(++i, 2);
        });
        equal(++i, 1);
        setTimeout(start, 100);
    });
});
