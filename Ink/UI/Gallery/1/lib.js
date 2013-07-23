/**
 * @module Ink.UI.Gallery_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Gallery', '1',
    ['Ink.UI.Aux_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.Dom.Event_1', 'Ink.UI.ImageCell_1'],
    function(Aux, Css, Elem, Evt, ImageCell) {

    'use strict';

    /*jshint laxcomma:true */



    /**
     * @class Ink.UI.Gallery
     *
     * TODO
     * - test without thumbnails
     * - sample with JSON model
     * - swipe support
     * - optional page indicator
     * - optional caption
     * - mark current thumb in some way
     * - animate thumbnail change?
     * - different thumbnail placements
     * - optional autonext timer
     * - finish fullscreen mode
     * - documentation, samples
     *
     * @constructor
     * @param  {String|DOMElement} selector
     * @param  {Object}  options
     * @param  {Array}  [options.thumbDims]      dimensions of thumbnails, in pixels. default is [128, 128]
     * @param  {String} [options.thumbMode]      either cover or contain. default is cover
     * @param  {String} [options.mainMode]       either cover or contain. default is contain
     * @param  {Number} [options.aspectRatio]    aspect ratio for the gallery. default is 4/3
     * @param  {Boolean} [options.circular]      if true, gallery wraps around limits. default is true
     * @param  {Boolean} [options.adaptToResize] if true, gallery updates on window size change
     */
    var Gallery = function(selector, options) {

        // parse container and options
        this._containerEl = Aux.elOrSelector(selector, '1st argument');

        this._options = Ink.extendObj({
             thumbDims:     [128, 128]
            ,thumbMode:     'cover'
            ,mainMode:      'contain'
            ,direction:     'x'             // TODO not yet in use
            ,aspectRatio:   4/3
            ,adaptToResize: true
            ,circular:      true
        }, Elem.data(this._containerEl));

        this._options = Ink.extendObj(this._options, options || {});

        var ops = this._options;

        // boolean
        if (typeof ops.circular === 'string' && ops.circular !== 'true') {
            ops.circular = false;
        }
        if (typeof ops.adaptToResize === 'string' && ops.adaptToResize !== 'true') {
            ops.adaptToResize = false;
        }

        // int,int
        if (typeof ops.thumbDims === 'string') {
            ops.thumbDims = ops.thumbDims.split(',');
            ops.thumbDims[0] = parseInt(ops.thumbDims[0], 10);
            ops.thumbDims[1] = parseInt(ops.thumbDims[1], 10);
        }

        // float
        if (typeof ops.aspectRatio === 'string') {
            ops.aspectRatio = parseFloat( ops.aspectRatio );
        }



        // find meaningful markup elements
        this._stageEl       = Ink.s('.stage',        this._containerEl);
        this._thumbHolderEl = Ink.s('.thumb-holder', this._containerEl);
        this._prevEl = Ink.s('.prev', this._stageEl);
        this._nextEl = Ink.s('.next', this._stageEl);

        Elem.removeTextNodeChildren(this._stageEl);
        Elem.removeTextNodeChildren(this._thumbHolderEl);

        if (!this._stageEl) {
            throw new Error('Could not find any descendant element having the class stage!');
        }

        if (!this._thumbHolderEl) {
            throw new Error('Could not find any descendant element having the class thumb-holder!');
        }



        // extract model
        this._model = [];
        this._sTmp = [];
        this._tTmp = [];



        // a) traverse .stage children
        var o, el = this._stageEl.firstChild;
        while (el) {
            if ( el.nodeType !== 1 /*||
                 Css.hasClassName(el, 'prev') ||
                 Css.hasClassName(el, 'next')*/ ) {
                el = el.nextSibling;
                continue;
            }

            o = {};

            if (el.nodeName.toLowerCase() === 'img') {
                o.mainSrc = el.getAttribute('src');
                this._model.push(o);
                this._sTmp.push(el); // we store the elements to replace them
            }

            //console.log('s', el);

            el = el.nextSibling;
        }


        // b) traverse .thumb-holder children
        var i = 0;
        el = this._thumbHolderEl.firstChild;
        while (el) {
            if (el.nodeType !== 1) {
                el = el.nextSibling;
                continue;
            }

            o = this._model[i++];

            if (el.nodeName.toLowerCase() === 'img') {
                o.thumbSrc = el.getAttribute('src');
                this._tTmp.push(el); // we store the elements to replace them
            }

            //console.log('t', el);

            el = el.nextSibling;
        }



        this._render();



        // events
        Evt.observe(this._containerEl, 'click', Ink.bindEvent(this._onClick, this) );

        if (this._options.adaptToResize) {
            Evt.observe(window, 'resize', Ink.bindEvent(this._onResize, this) );
        }



        this._currentIndex = 0;


        console.log(this);
    };

    Gallery.prototype = {

        getLength: function() {
            return this._model.length;
        },

        getIndex: function() {
            return this._currentIndex;
        },

        getItem: function() {
            return Aux.clone( this._model[ this._currentIndex ] );
        },

        goTo: function(index, isRelative) {
            var i = this._currentIndex;
            var l = this._model.length;
            var circ = this._options.circular;

            if (isRelative) {
                i += index;
            }
            else {
                i = index;
            }

            if (i < 0) {
                if (!circ) { return; }
                i += l;
            }
            else if (i >= l) {
                if (!circ) { return; }
                i -= l;
            }

            this._goTo(i);
        },

        previous: function() {
            this.goTo(-1, true);
        },

        next: function() {
            this.goTo(1, true);
        },

        isInFullScreen: function() {
            return this._inFullScreen;
        },

        toggleFullScreen: function() {
            this._inFullScreen = !this._inFullScreen;
            Css.addRemoveClassName(this._containerEl, 'ink-galleryx-fullscreen', this._inFullScreen);
            this._render();
        },



        _goTo: function(i) {
            if (i !== undefined) {
                this._currentIndex = i;
            }
            else {
                i = this._currentIndex;
            }

            var w = this._mainDims[0];
            var ww = this._options.thumbDims[0];
            this._stageEl.style.marginLeft = '-' + (i * w) + 'px';
            this._thumbHolderEl.scrollLeft = i * ww;
        },

        _render: function() {
            var l = this._model.length;

            var mainDims = [0, 0];
            if (this._inFullScreen) { // TODO ONGOING
                mainDims[0] = window.innerWidth;
                mainDims[1] = window.innerHeight;
                if (mainDims[0] / mainDims[1] > this._options.aspectRatio) {
                    mainDims[0] = mainDims[1] * this._options.aspectRatio;
                }
                else {
                    mainDims[1] = mainDims[0] / this._options.aspectRatio;
                }
                var scl = (mainDims[1] - this._options.thumbDims[1]) / mainDims[1];
                mainDims = [~~(mainDims[0] * scl), ~~(mainDims[1] * scl)];
            }
            else {
                mainDims[0] = this._containerEl.offsetWidth;
                mainDims[1] = ~~(mainDims[0] * 1/this._options.aspectRatio);
            }

            this._mainDims = mainDims;

            if (this._options.direction === 'x') {
                Css.addClassName(this._stageEl, 'horizontal');
                this._stageEl.style.width = (mainDims[0] * l) + 'px';
            }

            this._stageEl.style.height = mainDims[1] + 'px';

            var o, i, sEl, tEl, ic;
            for (i = 0; i < l; ++i) {
                o = this._model[i];
                sEl = this._sTmp[i];
                tEl = this._tTmp[i];

                if (tEl) {
                    ic = new ImageCell({
                        uri:      o.thumbSrc,
                        skipCss3: false,
                        cellDims: this._options.thumbDims,
                        mode:     this._options.thumbMode
                    });
                    this._thumbHolderEl.replaceChild(ic.el, tEl);
                    this._tTmp[i] = ic.el;
                }

                ic = new ImageCell({
                    uri:      o.mainSrc,
                    skipCss3: false,
                    cellDims: mainDims,
                    mode:     this._options.mainMode
                });
                this._stageEl.replaceChild(ic.el, sEl);
                this._sTmp[i] = ic.el;
            }

            // correct prev/next size (to keep hitbox not over thumbnails)
            var s;
            s = this._prevEl.style;
            s.height = 'auto';
            s.bottom = this._options.thumbDims[1] + 'px';
            s = this._nextEl.style;
            s.height = 'auto';
            s.bottom = this._options.thumbDims[1] + 'px';

            this._goTo();
        },

        _onClick: function(ev) {
            var el = Evt.element(ev);

            //console.log('click', el);

            var hasPrev = Css.hasClassName(el, 'prev');
            var hasNext = Css.hasClassName(el, 'next');

            Evt.stop(ev);

            if (hasPrev || hasNext) {
                this.goTo(hasPrev ? -1 : 1, true);
            }
            else if (Css.hasClassName(el, 'image-cell')) {
                var i = Aux.childIndex(el);
                this._goTo(i);
            }
        },

        _onResize: function() {
            if (this._containerEl.offsetWidth !== this._mainDims[0]) {
                this._render();
            }
        }

    };



    return Gallery;

});
