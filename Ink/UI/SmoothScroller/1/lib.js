
Ink.createModule('Ink.UI.SmoothScroller', '1', ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Dom.Loaded_1'], function(Aux, Event, Css, Element, Selector, Loaded ) {
    'use strict';

    /**
     * @class SmoothScroller
     *
     * @since October 2012
     * @author jose.p.dias AT co.sapo.pt
     * @version 0.1
     *
     * <pre>
     * </pre>
     */

    /**
     * @constructor SAPO.Ink.SmoothScroller.?
     * @param {String|DOMElement} selector
     * @param {Object}            options
     * @... {optional Number}               speed           By default is 10. Determines the speed of the scroll
     */
    var SmoothScroller = {
        // control the speed of the scroller.
        // dont change it here directly, please use Scroller.speed=50;
        speed: 10,

        // returns the Y position of the div
        gy: function(d) {
            var gy;
            gy = d.offsetTop;
            if (d.offsetParent){
                while ( (d = d.offsetParent) ){
                    gy += d.offsetTop;
                }
            }
            return gy;
        },

        // returns the current scroll position
        scrollTop: function() {
            var
                body = document.body,
                d = document.documentElement
            ;
            if (body && body.scrollTop){
                return body.scrollTop;
            }
            if (d && d.scrollTop){
                return d.scrollTop;
            }
            if (window.pageYOffset)
            {
                return window.pageYOffset;
            }
            return 0;
        },

        // attach an event for an element
        // (element, type, function)
        add: function(event, body, d) {
            Event.observe(event,body,d);
            return;
        },

        // kill an event of an element
        end: function(e) {
            if (window.event) {
                window.event.cancelBubble = true;
                window.event.returnValue = false;
                return;
            }
            Event.stop(e);
        },

        // move the scroll bar to the particular div.
        scroll: function(d) {
            var a = SmoothScroller.scrollTop();
            if (d > a) {
                a += Math.ceil((d - a) / SmoothScroller.speed);
            } else {
                a = a + (d - a) / SmoothScroller.speed;
            }

            window.scrollTo(0, a);
            if ((a) === d || SmoothScroller.offsetTop === a)
            {
                clearInterval(SmoothScroller.interval);
            }
            SmoothScroller.offsetTop = a;
        },
        // initializer that adds the renderer to the onload function of the window
        init: function() {
            Loaded.run(SmoothScroller.render);
        },

        // this method extracts all the anchors and validates then as # and attaches the events.
        render: function() {
            var a = Selector.select('a.scrollableLink');

            SmoothScroller.end(this);

            for (var i = 0; i < a.length; i++) {
                var l = a[i];
                if (l.href && l.href.indexOf('#') !== -1 && ((l.pathname === location.pathname) || ('/' + l.pathname === location.pathname))) {
                    SmoothScroller.add(l, 'click', SmoothScroller.end);
                    Event.observe(l,'click',SmoothScroller.clickScroll);
                }
            }
        },

        clickScroll: function() {
            SmoothScroller.end(this);
            var hash = this.hash.substr(1);
            var elm = Selector.select('a[name="' + hash + '"],#' + hash);

            if (typeof(elm[0]) !== 'undefined') {

                if (this.parentNode.className.indexOf('active') === -1) {
                    var ul = this.parentNode.parentNode,
                        li = ul.firstChild;
                    do {
                        if ((typeof(li.tagName) !== 'undefined') && (li.tagName.toUpperCase() === 'LI') && (li.className.indexOf('active') !== -1)) {
                            li.className = li.className.replace('active', '');
                            break;
                        }
                    } while ((li = li.nextSibling));
                    this.parentNode.className += " active";
                }
                clearInterval(SmoothScroller.interval);
                SmoothScroller.interval = setInterval('SmoothScroller.scroll(' + SmoothScroller.gy(elm[0]) + ')', 10);

            }
            //document.getElementsByTagName('a');
            // for (i=0;i<a.length;i++) {
            //    if(a[i].name == l){
            // }
            // }
        }
    };
    SmoothScroller.init();

    return SmoothScroller;

});
