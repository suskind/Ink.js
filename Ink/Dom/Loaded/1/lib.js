/**
 * @module Ink.Dom.Loaded_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.Dom.Loaded', 1, [], function() {

    'use strict';

    /**
     * The Loaded class provides a method that allows developers to queue functions to run when
     * the page is loaded (document is ready).
     *
     * @class Ink.Dom.Loaded
     * @version 1
     * @static
     */
    var Loaded = {

        /**
         * Functions queue.
         *
         * @property _cbQueue
         * @type {Array}
         * @private
         * @static
         * @readOnly
         */
        _cbQueue: [], // Callbacks' queue

        /**
         * Adds a new function that will be invoked once the document is ready
         *
         * @method run
         * @param {Object}   [win] Window object to attach/add the event
         * @param {Function} fn  Callback function to be run after the page is loaded
         * @public
         * @example
         *     Ink.requireModules(['Ink.Dom.Loaded_1'],function(Loaded){
         *         new Loaded.run(function(){
         *             console.log('This will run when the page/document is ready/loaded');
         *         });
         *     });
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
            }
            else {
                this._cbQueue.push(fn);

                this._doc[this._add]( this._det , csf );
                this._win[this._add]( this._wet , csf );

                var frameElement = 1;
                try{
                    frameElement = this._win.frameElement;
                } catch(e) {}

                if ( !ael && this._root.doScroll ) { // IE HACK
                    try {
                        this._top = !frameElement;
                    } catch(e) { }
                    if (this._top) {
                        this._poll();
                    }
                }
            }
        },

        /**
         * Function that will be running the callbacks after the page is loaded
         *
         * @method _checkState
         * @param {Event} event Triggered event
         * @private
         */
        _checkState: function(event) {
            if ( !event || (event.type === 'readystatechange' && this._doc.readyState !== 'complete')) {
                return;
            }
            var where = (event.type === 'load') ? this._win : this._doc;
            where[this._rem](this._pre+event.type, this._handlers.checkState, false);
            this._ready();
        },

        /**
         * Polls the load progress of the page to see if it has already loaded or not
         *
         * @method _poll
         * @private
         */

        /**
         *
         * function _poll
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
         * Function that runs the callbacks from the queue when the document is ready.
         *
         * @method _ready
         * @private
         */
        _ready: function() {
            if (!this._done) {
                this._done = true;
                for (var i = 0; i < this._cbQueue.length; ++i) {
                    this._cbQueue[i].call(this._win);
                }
                this._cbQueue = [];
            }
        }
    };

    return Loaded;

});
