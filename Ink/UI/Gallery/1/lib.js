
Ink.createModule('Ink.UI.Gallery', '1',
    ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1','Ink.Util.Swipe_1'],
    function(Aux, Event, Css, Element, Selector, InkArray, Swipe) {

    'use strict';

    /**
     * @module Ink.UI.Gallery_1
     */

    var maximizeBox = function(maxSz, imageSz, forceMaximize) {
        var w = imageSz[0];
        var h = imageSz[1];

        if (forceMaximize || (w > maxSz[0] || h > maxSz[1]) ) {
            var arImg = w / h;
            var arMax = maxSz[0] / maxSz[1];
            var s = (arImg > arMax) ? maxSz[0] / w : maxSz[1] / h;
            return [parseInt(w * s + 0.5, 10), parseInt(h * s + 0.5, 10)];
        }

        return imageSz;
    };

    var getDimsAsync = function(o, cb) {
        cb = Ink.bind(cb,o);

        var dims = [o.img.offsetWidth, o.img.offsetHeight];
        if (dims[0] && dims[1]) {
            cb(dims);
        }
        o.img.onload = Ink.bindEvent(function() {
            cb([this.img.offsetWidth, this.img.offsetHeight]);
        },o);
    };

    /**
     * @class Ink.UI.Gallery
     *
     * @since October 2012
     * @author jose.p.dias AT co.sapo.pt
     * @version 0.1
     *
     * <pre>
     * The gallery provides a way of displaying an array of images.
     * It can be initialized by either the microformats-only ul-based DOM markup or a JSON model
     *
     * TODOs:
     *   - reapply microformats to final markup
     *
     * Microformats consumed:
     *   hentry - http://microformats.org/wiki/hentry
     *   hmedia - http://microformats.org/wiki/hmedia
     * </pre>
     */

    /**
     * @constructor Ink.UI.Gallery.?
     * @param {String|DOMElement} selector
     * @param {Object}            options
     * @... {optional Boolean} circular       whether to allow wrapping the limits of the collection or stop at end/beginning. defaults to false
     * @... {optional Number}  layout         0-3. defaults to 0
     * @... {optional Boolean} fixImageSizes  if true, image sizes are inspected via preload or read from dims/width+height and made to respect the container dims (by default 600x400)
     */
    var Gallery = function(selector, options) {

        this._element = Aux.elOrSelector(selector, '1st argument');

        this._options = Ink.extendObj({
            fullImageMaxWidth:   600,
            fullImageMaxHeight:  400,
            thumbnailMaxWidth:   106,
            layout:              0,
            circular:            false,
            fixImageSizes:       false
        }, Element.data(this._element));

        this._options = Ink.extendObj(this._options, options || {});

        this._handlers = {
            navClick:        Ink.bindEvent(this._onNavClick,this),
            paginationClick: Ink.bindEvent(this._onPaginationClick,this),
            thumbsClick:     Ink.bindEvent(this._onThumbsClick,this),
            focusBlur:       Ink.bindEvent(this._onFocusBlur,this),
            keyDown:         Ink.bindEvent(this._onKeyDown,this)
        };

        this._isFocused = false;
        this._model = [];

        if (this._options.model instanceof Array) {
            this._model = this._options.model;
            this._createdFrom = 'JSON';
        }
        else if (this._element.nodeName.toLowerCase() === 'ul') {
            this._createdFrom = 'DOM';
        }
        else {
            throw new TypeError('You must pass a selector expression/DOM element as 1st option or provide a model on 2nd argument!');
        }

        this._index      = 0;
        this._thumbIndex = 0;

        if( !isNaN(this._options.layout) ){

            this._options.layout = parseInt(this._options.layout,10);
            if (this._options.layout === 0) {
                this._showThumbs            = false;
                this._showDescription       = false;
                this._paginationHasPrevNext = false;
            }
            else if (this._options.layout === 1 || this._options.layout === 2 || this._options.layout === 3) {
                this._showThumbs            = true;
                this._showDescription       = true;
                this._paginationHasPrevNext = true;
            }
            else {
                throw new TypeError('supported layouts are 0-3!');
            }
        }

        if (this._element.getAttribute('data-fix-image-sizes') !== null) {
            this._options.fixImageSizes = true;
        }

        this._init();
    };

    Gallery.prototype = {

        _init: function() {
            // extract model
            if (this._createdFrom === 'DOM') {
                this._extractModelFromDOM();
            }

            // generate and apply DOM
            var el = this._generateMarkup();
            var parentEl = this._element.parentNode;

            if (!this._notFirstInit) {
                Aux.storeIdAndClasses(this._element, this);
                this._notFirstInit = true;
            }

            parentEl.insertBefore(el, this._element);
            parentEl.removeChild(this._element);
            this._element = el;

            Aux.restoreIdAndClasses(this._element, this);

            // subscribe events
            Event.observe(this._paginationEl, 'click',     this._handlers.paginationClick);
            Event.observe(this._navEl,        'click',     this._handlers.navClick);

            if (this._showThumbs) {
                Event.observe(this._thumbsUlEl,   'click',     this._handlers.thumbsClick);
            }

            Event.observe(this._element,      'mouseover', this._handlers.focusBlur);
            Event.observe(this._element,      'mouseout',  this._handlers.focusBlur);
            Event.observe(document,           'keydown',   this._handlers.keyDown);

            Aux.registerInstance(this, this._element, 'gallery');
        },

        /**
         * @function ? updates the model from the UL representation
         */
        _extractModelFromDOM: function() {
            /*global console:false */
            var m = [];
            var dims;

            var liEls = Selector.select('> li', this._element);
            InkArray.each(liEls,function(liEl) {
                try {
                    var d = {
                        image_full:  '',
                        image_thumb: '',
                        title_text:  '',
                        title_link:  '',
                        description: '',
                        content_overlay: document.createDocumentFragment()
                    };

                    var enclosureAEl       = Selector.select('> a[rel=enclosure]',          liEl)[0];
                    var thumbImgEl         = Selector.select('> img',                       enclosureAEl)[0];
                    var bookmarkAEl        = Selector.select('> a[class=bookmark]',         liEl)[0];
                    var titleSpanEl        = Selector.select('span[class=entry-title]',     liEl)[0];
                    var entryContentSpanEl = Selector.select('> span[class=entry-content]', liEl)[0];
                    var contentOverlayEl   = Selector.select('> .content-overlay',          liEl)[0];

                    dims = enclosureAEl.getAttribute('data-dims');
                    if (dims !== null) {
                        dims = dims.split(',');
                        dims[0] = parseInt(dims[0], 10);
                        dims[1] = parseInt(dims[1], 10);
                    }
                    if (dims && !isNaN(dims[0]) && !isNaN(dims[1])) { d.dims = dims; }

                    d.image_full  = enclosureAEl.getAttribute('href');
                    d.image_thumb = thumbImgEl.getAttribute('src');
                    if (bookmarkAEl) {
                        d.title_link  = bookmarkAEl.getAttribute('href');
                    }
                    d.title_text  = titleSpanEl.innerHTML;
                    if (entryContentSpanEl) {
                        d.description = entryContentSpanEl.innerHTML;
                    }

                    if(contentOverlayEl){
                        d.content_overlay.appendChild(contentOverlayEl);
                    }

                    m.push(d);
                } catch(ex) {
                    console.error('problematic element:');
                    console.error(liEl);
                    console.error(ex);
                    throw new Error('Problem parsing gallery data from DOM!');
                }
            });

            this._model = m;
        },

        /**
         * @function {DOMElement} ? returns the top element for the gallery DOM representation
         */
        _generateMarkup: function() {
            /*jshint maxstatements:80 */
            var el = document.createElement('div');
            el.className = 'ink-gallery';

            var stageEl = document.createElement('div');
            stageEl.className = 'stage';

            // nav
            var navEl = document.createElement('nav');
            navEl.innerHTML = [
                '<ul class="unstyled">',
                    '<li><a href="#" class="next"></a></li>',
                    '<li><a href="#" class="previous"></a></li>',
                '</ul>'
            ].join('');
            this._navEl = navEl;

            // slider
            var sliderEl = document.createElement('div');
            sliderEl.className = 'slider';

            var ulEl = document.createElement('ul');
            this._sliderUlEl = ulEl;

            var that = this;

            var W = this._options.fullImageMaxWidth;
            var H = this._options.fullImageMaxHeight;

            InkArray.each(this._model,function(d, i) {
                var liEl = document.createElement('li');
                var imgEl = document.createElement('img');
                imgEl.setAttribute('name', 'image ' + (i + 1));
                imgEl.setAttribute('src',  d.image_full);
                imgEl.setAttribute('alt',  d.title_text);
                //imgEl.style.maxWidth = that._options.fullImageMaxWidth + 'px';
                //imgEl.setAttribute('width', that._options.fullImageMaxWidth);       // TODO?
                liEl.appendChild(imgEl);

                if(d.content_overlay){
                    if(d.content_overlay.nodeType === 1 || d.content_overlay.nodeType === 11){
                        d.content_overlay = liEl.appendChild(d.content_overlay);
                    } else if(typeof d.content_overlay === 'string'){
                        var contentOverlayEl = document.createElement('div');

                        contentOverlayEl.className = 'content-overlay';
                        contentOverlayEl.innerHTML = d.content_overlay;

                        d.content_overlay = liEl.appendChild(contentOverlayEl);
                    }
                }

                ulEl.appendChild(liEl);

                if (that._options.fixImageSizes) {
                    var dimsCb = function(dims) {
                        //console.log(this, dims);
                        var imgEl = this.img;
                        var data  = this.data;

                        if (!data.dims) { data.dims = dims; }

                        var dims2 = maximizeBox([W, H], dims);

                        var w = dims2[0];
                        var h = dims2[1];
                        var dw = Math.floor( (W - w)/2 );
                        var dh = Math.floor( (H - h)/2 );

                        if (w !== W || h !== H) {
                            imgEl.setAttribute('width',  w);
                            imgEl.setAttribute('height', h);

                            var s = imgEl.style;
                            if (dw > 0) { s.paddingLeft   = dw + 'px'; }
                            if (dh > 0) { s.paddingBottom = dh + 'px'; }
                        }
                    };

                    if (d.dims) { dimsCb.call( {img:imgEl, data:d}, d.dims); }
                    else {        getDimsAsync({img:imgEl, data:d}, dimsCb); }
                }
            });

            sliderEl.appendChild(ulEl);
            this._sliderEl = sliderEl;

            // description
            var articleTextDivEl;
            if (this._showDescription) {
                var d = this._model[this._index];
                articleTextDivEl = document.createElement('div');
                articleTextDivEl.className = ['article_text', 'example' + (this._options.layout === 3 ? 2 : this._options.layout)].join(' ');
                if (d.title_link) {
                    articleTextDivEl.innerHTML = ['<h1><a href="', d.title_link, '">', d.title_text, '</a></h1>', d.description].join('');
                }
                else {
                    articleTextDivEl.innerHTML = ['<h1>', d.title_text, '</h1>', d.description].join('');
                }
                this._articleTextDivEl = articleTextDivEl;
            }

            // thumbs
            var thumbsDivEl;
            if (this._showThumbs) {
                thumbsDivEl = document.createElement('div');
                thumbsDivEl.className = 'thumbs';
                ulEl = document.createElement('ul');
                ulEl.className = 'unstyled';

                InkArray.each(this._model,function(d, i) {
                    var liEl = document.createElement('li');
                    var aEl = document.createElement('a');
                    aEl.setAttribute('href', '#');
                    var imgEl = document.createElement('img');
                    imgEl.setAttribute('name', 'thumb ' + (i + 1));
                    imgEl.setAttribute('src', d.image_thumb);
                    imgEl.setAttribute('alt', (i + 1));
                    var spanEl = document.createElement('span');
                    spanEl.innerHTML = d.title_text;
                    aEl.appendChild(imgEl);
                    aEl.appendChild(spanEl);
                    liEl.appendChild(aEl);
                    ulEl.appendChild(liEl);
                });
                thumbsDivEl.appendChild(ulEl);

                this._thumbsDivEl = thumbsDivEl;
                this._thumbsUlEl = ulEl;
            }


            // pagination
            var paginationEl = document.createElement('div');
            paginationEl.className = 'pagination';

            var aEl;
            if (this._paginationHasPrevNext) {
                aEl = document.createElement('a');
                aEl.setAttribute('href', '#');
                aEl.className = 'previous';
                paginationEl.appendChild(aEl);
            }

            InkArray.each(this._model,function(d, i) {
                var aEl = document.createElement('a');
                aEl.setAttribute('href', '#');
                aEl.setAttribute('data-index', i);
                if (i === that._index) { aEl.className = 'active'; }
                paginationEl.appendChild(aEl);
            });

            if (this._paginationHasPrevNext) {
                aEl = document.createElement('a');
                aEl.setAttribute('href', '#');
                aEl.className = 'next';
                paginationEl.appendChild(aEl);
            }

            this._paginationEl = paginationEl;

            // last appends...
            if (this._options.layout === 0) {
                stageEl.appendChild(navEl);
                stageEl.appendChild(sliderEl);
                stageEl.appendChild(paginationEl);
                el.appendChild(stageEl);
            }
            else if (this._options.layout === 1 || this._options.layout === 2 || this._options.layout === 3) {
                stageEl.appendChild(navEl);
                stageEl.appendChild(sliderEl);
                stageEl.appendChild(articleTextDivEl);
                el.appendChild(stageEl);

                if (this._options.layout === 3) {
                    //this._thumbsUlEl.appendChild(paginationEl);
                    this._thumbsUlEl.className = 'thumbs unstyled';
                    Css.addClassName(el, 'rightNav');
                    el.appendChild(this._thumbsUlEl);
                }
                else {
                    thumbsDivEl.appendChild(paginationEl);
                    el.appendChild(thumbsDivEl);
                }
            }

            this._swipeDir = 'x';
            this._swipeThumbsDir = this._options.layout === 0 ? '' : (this._options.layout === 3 ? 'y' : 'x');

            if (Swipe._supported) {
                new Swipe(el, {
                    callback:    Ink.bind(function(sw, o) {
                        var th =              this._isMeOrParent(o.target, this._thumbsUlEl);
                        var sl = th ? false : this._isMeOrParent(o.target, el);//this._sliderUlEl);
                        if ( (!th && !sl) || (th && !this._swipeThumbsDir) ) { return; }
                        if ( (sl && o.axis !== this._swipeDir) || (th && o.axis !== this._swipeThumbsDir) ) { return; }
                        if (o.dr[0] < 0) { if (th) { this.thumbNext();     } else { this.next();     } }
                        else {             if (th) { this.thumbPrevious(); } else { this.previous(); } }
                    },this),
                    maxDuration: 0.4,
                    minDist:     50
                });
            }

            return el;
        },

        _isMeOrParent: function(el, parentEl) {
            if (!el) {return;}
            do {
                if (el === parentEl) { return true; }
                el = el.parentNode;
            } while (el);
            return false;
        },

        /**
         * @function ? navigation click handler
         * @param {Event} ev
         */
        _onNavClick: function(ev) {
            var tgtEl = Event.element(ev);
            var delta;
            if      (Css.hasClassName(tgtEl, 'previous')) { delta = -1; }
            else if (Css.hasClassName(tgtEl, 'next')) {     delta =  1; }
            else { return; }

            Event.stop(ev);
            this.goTo(delta, true);
        },

        /**
         * @function ? pagination click handler
         * @param {Event} ev
         */
        _onPaginationClick: function(ev) {
            var tgtEl = Event.element(ev);
            var i = tgtEl.getAttribute('data-index');
            var isRelative = false;
            if      (Css.hasClassName(tgtEl, 'previous')) { i = -1; isRelative = true; }
            else if (Css.hasClassName(tgtEl, 'next')) {     i =  1; isRelative = true; }
            else if (i === null) { return; }
            else { i = parseInt(i, 10); }
            Event.stop(ev);

            if (isRelative) { this.thumbGoTo(i, true); }
            else {            this.goTo(i);            }
        },

        /**
         * @function ? thumbs click handler
         * @param {Event} ev
         */
        _onThumbsClick: function(ev) {
            var tgtEl = Event.element(ev);
            if      (tgtEl.nodeName.toLowerCase() === 'img') {}
            else if (tgtEl.nodeName.toLowerCase() === 'span') {
                tgtEl = Selector.select('> img', tgtEl.parentNode)[0];
            }
            else { return; }

            Event.stop(ev);
            var i = parseInt(tgtEl.getAttribute('alt'), 10) - 1;
            this.goTo(i);
        },

        /**
         * @function ? focus handler
         * @param  {Event} ev
         */
        _onFocusBlur: function(ev) {
            this._isFocused = (ev.type === 'mouseover');
        },

        /**
         * @function ? key handler
         * @param  {Event} ev
         */
        _onKeyDown: function(ev) {
            if (!this._isFocused) { return; }
            var kc = ev.keyCode;
            if      (kc === 37) { this.previous(); }
            else if (kc === 39) { this.next();     }
            else { return; }
            Event.stop(ev);
        },

        _validateValue: function(i, isRelative, isThumb) {
            // check arguments
            if (!Aux.isInteger(i)) {
                throw new TypeError('1st parameter must be an integer number!');
            }
            if ( isRelative !== undefined &&
                 isRelative !== false     &&
                 isRelative !== true ) {
                throw new TypeError('2nd parameter must either be boolean or ommitted!');
            }

            var val = isThumb ? this._thumbIndex : this._index;

            // compute new index
            if (isRelative) { i += val; }

            if (this._options.circular) {
                if      (i < 0) {                   i = this._model.length - 1; }
                else if (i >= this._model.length) { i = 0;                      }
            }
            else {
                if (i < 0 || i >= this._model.length || i === val) { return false; }
            }

            return i;
        },



        /**************
         * PUBLIC API *
         **************/

        /**
         * @function {Number} ? returns the index of the current image
         */
        getIndex: function() {
            return this._index;
        },

        /**
         * @function {Number} ? returns the number of images in the gallery
         */
        getLength: function() {
            return this._model.length;
        },

        /**
         * @function ? moves gallery to the nth - 1 image
         * @param  {Number}           i          absolute or relative index
         * @param  {optional Boolean} isRelative pass true for relative movement, otherwise absolute
         */
        goTo: function(i, isRelative) {
            i = this._validateValue(i, isRelative, false);
            if (i === false) { return; }
            this._index = i;

            // update DOM representation
            var paginationAEls = Selector.select('> a', this._paginationEl);
            var that = this;
            InkArray.each(paginationAEls,function(aEl, i) {
                Css.setClassName(aEl, 'active', (i - (that._paginationHasPrevNext ? 1 : 0)) === that._index);
            });

            this._sliderUlEl.style.marginLeft = ['-', this._options.fullImageMaxWidth * this._index, 'px'].join('');

            if (this._showDescription) {
                var d = this._model[this._index];
                if (d.title_link) {
                    this._articleTextDivEl.innerHTML = ['<h1><a href="', d.title_link, '">', d.title_text, '</a></h1>', d.description].join('');
                }
                else {
                    this._articleTextDivEl.innerHTML = ['<h1>', d.title_text, '</h1>', d.description].join('');
                }
            }
        },

        /**
         * @function ? moves gallery to the nth - 1 thumb
         * @param  {Number}           i          absolute or relative index
         * @param  {optional Boolean} isRelative pass true for relative movement, otherwise absolute
         */
        thumbGoTo: function(i, isRelative) {
            i = this._validateValue(i, isRelative, true);
            if (i === false) { return; }
            this._thumbIndex = i;

            // update DOM representation
            var prop = 'margin' + (this._swipeThumbsDir === 'x' ? 'Left' : 'Top');
            this._thumbsUlEl.style[prop] = ['-', this._options.thumbnailMaxWidth * this._thumbIndex, 'px'].join('');
        },

        /**
         * @function ? move to the previous image
         */
        previous: function() {
            this.goTo(-1, true);
        },

        /**
         * @function ? move to the next image
         */
        next: function() {
            this.goTo(1, true);
        },

        /**
         * @function ? move to the previous thumb
         */
        thumbPrevious: function() {
            this.thumbGoTo(-1, true);
        },

        /**
         * @function ? move to the next thumb
         */
        thumbNext: function() {
            this.thumbGoTo(1, true);
        },

        /**
         * @function ? unregisters the component and removes its markup from the DOM
         */
        destroy: Aux.destroyComponent

    };

    return Gallery;

});
