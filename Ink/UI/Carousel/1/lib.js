/**
 * @module Ink.UI.Table_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Carousel', '1',
    ['Ink.UI.Aux_1', 'Ink.Dom.Event_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.UI.Pagination_1', 'Ink.Dom.Selector_1'],
    function(Aux, Event, Css, Element, Pagination/*, Selector*/) {

    'use strict';



    /**
     * TODO:
     *  keyboardSupport
     *  swipe
     */

    var Carousel = function(selector, options) {
        this._handlers = {
            paginationChange: Ink.bind(this._onPaginationChange, this),
            windowResize:     Ink.bind(this._onWindowResize,     this),
            windowKeyDown:    Ink.bind(this._onWindowKeyDown,    this)
        };

        Event.observe(window, 'resize', this._handlers.windowResize);

        this._rootElement = Aux.elOrSelector(selector, '1st argument');

        this._options = Ink.extendObj(
            {
                axis:            'x',
                center:          false,
                keyboardSupport: false
            },
            Element.data(this._rootElement)
        );

        if (options) {
            this._options = Ink.extendObj(
                this._options,
                options
            );
        }

        var rEl = this._rootElement;

        var ulEl = Ink.s('ul', rEl);
        this._ulEl = ulEl;

        Element.removeTextNodeChildren(ulEl);

        var liEls = Ink.ss('li', ulEl);
        this._liEls = liEls;

        this._updateMeasurings();

        if (this._options.axis === 'y') {
            this._rootElement.style.width = liEls[0].offsetWidth + 'px';
            ulEl.style.width  =  liEls[0].offsetWidth + 'px';
            ulEl.style.height = (liEls[0].offsetHeight * this._numItems) + 'px';
        }
        else {
            ulEl.style.width  = (liEls[0].offsetWidth * this._numItems) + 'px';
            ulEl.style.height =  liEls[0].offsetHeight + 'px';
        }

        if (this._options.center) {
            this._center();
        }

        if (this._options.pagination) {
            this._pagination = new Pagination(this._options.pagination, {
                size:     this._numPages,
                onChange: this._handlers.paginationChange
            });
        }
    };

    Carousel.prototype = {

        _updateMeasurings: function() {
            var off = 'offset' + (this._options.axis === 'y' ? 'Height' : 'Width');
            this._numItems = this._liEls.length;
            this._ctnLength = this._rootElement[off];
            this._elLength = this._liEls[0][off];
            this._itemsPerPage = Math.floor( this._ctnLength / this._elLength  );
            this._numPages = Math.ceil( this._numItems / this._itemsPerPage );
            this._deltaLength = this._itemsPerPage * this._elLength;
        },

        _center: function() {
            var gap = Math.floor( (this._ctnLength - (this._elLength * this._itemsPerPage) ) / 2 );

            var pad;
            if (this._options.axis === 'y') {
                pad = [gap, 'px 0'];
            }
            else {
                pad = ['0 ', gap, 'px'];
            }
            this._ulEl.style.padding = pad.join('');
        },

        _onPaginationChange: function(pgn) {
            var currPage = pgn.getCurrent();
            this._ulEl.style[ this._options.axis === 'y' ? 'top' : 'left'] = ['-', currPage * this._deltaLength, 'px'].join('');
        },

        _onWindowResize: function() {
            this._updateMeasurings();

            if (this._options.pagination) {
                this._pagination.setSize(this._numPages);
                this._pagination.setCurrent(0);
            }

            if (this._options.center) {
                this._center();
            }
        },

        _onWindowKeyDown: function() {
            // TODO
        }

    };



    return Carousel;

});
