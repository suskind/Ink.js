/*jshint browser:true, eqeqeq:true, undef:true, curly:true, laxbreak:true, forin:true, smarttabs:true */
/*global Ink:false */

/**
 * @author inkdev AT sapo.pt
 */

Ink.createModule('Ink.Dom.Loaded', 1, [], function(undefined) {

    'use strict';

    var Loaded = {

        _cbQueue: [], // Callbacks' queue

        /**
         * @function ? adds a new function that will be invoked once the window is ready
         *
         * @paramset
         * @param {Object}   win Window object to attach/add the event
         * @param {Function} fn  Callback function to be run after the page is loaded.
         *
         * @paramset
         * @param {Function} fn   Callback function to be run after the page is loaded.
         */
        run: function(win, fn) {
            if (!fn) {
                fn  = win;
                win = window;
            }

            this._win  = win;
            this._doc  = win.document;
            this._root = this._doc.documentElement;
            this._done = false;
            this._top  = true;

            this._handlers = {
                checkState: Ink.bindEvent(this._checkState, this),
                poll:       Ink.bind(this._poll, this)
            };

            var   ael = this._doc.addEventListener;
            this._add = ael ? 'addEventListener' : 'attachEvent';
            this._rem = ael ? 'removeEventListener' : 'detachEvent';
            this._pre = ael ? '' : 'on';
            this._det = ael ? 'DOMContentLoaded' : 'onreadystatechange';
            this._wet = this._pre + 'load';

            var csf = this._handlers.checkState;

            if (this._doc.readyState === 'complete'){
                fn.call(this._win, 'lazy');
            } else {
                this._cbQueue.push(fn);

                this._doc[this._add]( this._det , csf );
                this._win[this._add]( this._wet , csf );

                if ( !ael && this._root.doScroll ) { // IE HACK
                    try { 
                        this._top = !this._win.frameElement; 
                    } catch(e) { }
                    if (this._top) { 
                        this._poll(); 
                    }
                }
            }
        },

       /**
        * @function ? function that will be running the callbacks after the page is loaded.
        * @param {Event} event Triggered event
        */
        _checkState: function(event) {
            if ( !event || (event && event.type === 'readystatechange' && this._doc.readyState !== 'complete')) { 
                return; 
            }
            var where = (event.type === 'load') ? this._win : this._doc;
            where[this._rem](this._pre+event.type, this._handlers.checkState, false);
            this._ready();
        },

        /**
         * @function ? polls the load progress of the page to see if it has already loaded or not
         */
        _poll: function() {
            try {
                this._root.doScroll('left');
            } catch(e) {
                return setTimeout(this._handlers.poll, 50);
            }
            this._ready();
        },

        /**
         * @function ? this function will run the callbacks from the queue.
         */
        _ready: function() {
            if (!this._done) {
                this._done = true;
                for (var i = 0; i < this._cbQueue.length; ++i) {
                    this._cbQueue[i].call(this._win);
                }
            }
        }
    };

    return Loaded; 
});
