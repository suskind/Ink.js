/**
 * @module Ink.UI.Gallery_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Gallery', '1',
    ['Ink.UI.Aux_1', 'Ink.Dom.Browser_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.Dom.Event_1', 'Ink.UI.ImageCell_1'],
    function(Aux, Brwsr, Css, Elem, Evt, ImageCell) {

    'use strict';

    /*jshint laxcomma:true */



    // http://caniuse.com/background-img-opts
    var ver = parseInt(Brwsr.version, 10);
    var doesNotSupportBgSize = (Brwsr.IE    && ver < 9) ||
                               (Brwsr.GECKO && ver < 4);



    var insertAtStart = function(container, element) {
        var firstChild = container.firstChild;
        if (!firstChild) {
            container.appendChild(element);
        }
        else {
            container.insertBefore(element, firstChild);
        }
    };

    var insertAfter = function(container, element, afterEl) {
        if (container.lastChild === afterEl) {
            container.appendChild(element);
        }
        else {
            container.insertBefore(element, afterEl.nextSibling);
        }
    };



    /**
     * @class Ink.UI.Gallery
     *
     * TODO
     * - swipe support
     * - optional page indicator
     * - optional caption
     * - mark current thumb in some way
     * - proxies to save bandwidth?
     * - prev/next vertical placement
     * - optional autonext timer
     * - animate thumbnail change? (nice to have)
     * - different thumbnail placements (nice to have)
     * - vertical mode (nice to have)
     * - transitions (nice to have)
     * - documentation, samples
     *
     * @constructor
     * @param  {String|DOMElement} selector
     * @param  {Object}   options
     * @param  {Array}   [options.model]          when defined, no DOM extraction is done. Object should have mainSrc and optionally thumbSrc
     * @param  {Array}   [options.thumbDims]      dimensions of thumbnails, in pixels. default is [128, 128]
     * @param  {String}  [options.thumbMode]      either cover or contain. default is cover
     * @param  {String}  [options.mainMode]       either cover or contain. default is contain
     * @param  {Number}  [options.aspectRatio]    aspect ratio for the gallery. default is 4/3
     * @param  {Boolean} [options.circular]       if true, gallery wraps around limits. default is true
     * @param  {Boolean} [options.adaptToResize]  if true, gallery updates on window size change
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



        this._currentIndex = 0;

        // find meaningful markup elements
        this._stageEl       = Ink.s('.stage',        this._containerEl);
        this._thumbHolderEl = Ink.s('.thumb-holder', this._containerEl);
        this._captionEl     = Ink.s('.caption',      this._containerEl);
        this._prevEl = Ink.s('.prev', this._stageEl);
        this._nextEl = Ink.s('.next', this._stageEl);

        if (!this._stageEl) {
            throw new Error('Could not find any descendant element having the class stage!');
        }

        Elem.removeTextNodeChildren(this._stageEl);

        if (this._thumbHolderEl) {
            Elem.removeTextNodeChildren(this._thumbHolderEl);
        }



        if (this._options.model) {
            this._model = Aux.clone(this._options.model);
            this._makeTempElements();
        }
        else {
            this._extractModel();
        }

        this._render();



        // events
        Evt.observe(this._containerEl, 'click', Ink.bindEvent(this._onClick, this) );

        if (this._options.adaptToResize) {
            Evt.observe(window, 'resize', Ink.bindEvent(this._onResize, this) );
        }
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
            if (!this._inFullScreen) {
                this._containerEl.style.width = '';
            }

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
            if (this._thumbHolderEl) {
                this._thumbHolderEl.scrollLeft = i * ww;
            }

            if (this._captionEl) {
                this._captionEl.innerHTML = this._model[i].caption || '';
            }
        },

        _makeTempElements: function() {
            var el, prevSEl, prevTEl, i, l = this._model.length;
            this._sTmp = new Array(l);
            this._tTmp = new Array(l);

            for (i = 0; i < l; ++i) {
                el = document.createElement('div');
                if (prevSEl) {
                    insertAfter(this._stageEl, el, prevSEl);
                }
                else {
                    insertAtStart(this._stageEl, el);
                }
                this._sTmp[i] = el;
                prevSEl = el;

                if (!this._thumbHolderEl) {
                    continue;
                }

                el = document.createElement('div');
                if (prevTEl) {
                    insertAfter(this._thumbHolderEl, el, prevTEl);
                }
                else {
                    insertAtStart(this._thumbHolderEl, el);
                }
                this._tTmp[i] = el;
                prevTEl = el;
            }
        },

        _extractModel: function() {
            this._model = [];
            this._sTmp = [];
            this._tTmp = [];

            // a) traverse .stage children
            var t, o, el = this._stageEl.firstChild;
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
                    t = el.getAttribute('alt');
                    if (t) {
                        o.caption = t;
                    }
                    this._model.push(o);
                    this._sTmp.push(el); // we store the elements to replace them
                }

                //console.log('s', el);

                el = el.nextSibling;
            }

            // b) traverse .thumb-holder children
            if (!this._thumbHolderEl) {
                return;
            }

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
        },

        _render: function() {
            var l = this._model.length;

            // measure mainDims and prepare stageEl
            var mainDims = [0, 0];
            if (this._inFullScreen) {
                mainDims[0] = window.innerWidth;
                mainDims[1] = window.innerHeight - (this._thumbHolderEl ? this._options.thumbDims[1] : 0);
                this._containerEl.style.width = mainDims[0] + 'px';
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
            if (this._captionEl) {
                this._captionEl.style.top = mainDims[1] + 'px';
            }


            // update DOM
            var o, i, sEl, tEl, ic;
            for (i = 0; i < l; ++i) {
                o = this._model[i];
                sEl = this._sTmp[i];
                tEl = this._tTmp[i];

                if (tEl instanceof ImageCell) {
                    //this._tTmp[i].resize(this._options.thumbDims); // these haven't changed so no need to update!
                }
                else if (tEl) {
                    ic = new ImageCell({
                        uri:      o.thumbSrc,
                        skipCss3: doesNotSupportBgSize,
                        cellDims: this._options.thumbDims,
                        mode:     this._options.thumbMode
                    });
                    this._thumbHolderEl.replaceChild(ic.el, tEl);
                    this._tTmp[i] = ic;
                }

                if (sEl instanceof ImageCell) {
                    this._sTmp[i].resize(mainDims);
                }
                else {
                    ic = new ImageCell({
                        uri:      o.mainSrc,
                        skipCss3: doesNotSupportBgSize,
                        cellDims: mainDims,
                        mode:     this._options.mainMode
                    });
                    this._stageEl.replaceChild(ic.el, sEl);
                    this._sTmp[i] = ic;
                }
            }

            // correct prev/next size (to keep hitbox not over thumbnails)
            if (this._thumbHolderEl) {
                var s;
                s = this._prevEl.style;
                s.height = 'auto';
                s.bottom = this._options.thumbDims[1] + 'px';
                s = this._nextEl.style;
                s.height = 'auto';
                s.bottom = this._options.thumbDims[1] + 'px';
            }

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
