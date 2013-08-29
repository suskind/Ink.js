/**
 * @module Ink.UI.Table_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Grid', '1',
    ['Ink.UI.Aux_1', 'Ink.Dom.Event_1', 'Ink.Dom.Css_1', 'Ink.Dom.Element_1', 'Ink.UI.Pagination_1', 'Ink.Dom.Selector_1'],
    function(Aux, Event, Css, Element, Pagination/*, Selector*/) {

    'use strict';



    /**
     * TODO:
     *  axis: 'y'
     */

    var Grid = function(selector, options) {
        this._handlers = {
            paginationChange: Ink.bind(this._onPaginationChange, this),
            windowResize:     Ink.bind(this._onWindowResize,     this)
        };

        Event.observe(window, 'resize', this._handlers.windowResize);

        this._rootElement = Aux.elOrSelector(selector, '1st argument');

        this._options = Ink.extendObj(
            {
                axis:   'x',
                center: false
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

        ulEl.style.width  = (liEls[0].offsetWidth * this._numItems) + 'px';
        ulEl.style.height =  liEls[0].offsetHeight + 'px';

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

    Grid.prototype = {

        _updateMeasurings: function() {
            this._numItems = this._liEls.length;
            this._ctnLength = this._rootElement.offsetWidth;
            this._elLength = this._liEls[0].offsetWidth;
            this._itemsPerPage = Math.floor( this._ctnLength / this._elLength  );
            this._numPages = Math.ceil( this._numItems / this._itemsPerPage );
            this._deltaLength = this._itemsPerPage * this._elLength;
        },

        _center: function() {
            var gap = Math.floor( (this._ctnLength - (this._elLength * this._itemsPerPage) ) / 2 );
            this._ulEl.style.padding = ['0 ', gap, 'px'].join('');
        },

        _onPaginationChange: function(pgn) {
            var currPage = pgn.getCurrent();
            this._ulEl.style.left = ['-', currPage * this._deltaLength, 'px'].join('');
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
        }

    };



    return Grid;

});
