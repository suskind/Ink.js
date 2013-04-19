
Ink.createModule('Ink.UI.Table', '1',
    ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1','Ink.UI.Pagination_1'],
    function(Aux, Event, Css, Element, Selector, InkArray, Pagination) {

    'use strict';

    /**
     * @module Ink.UI.Table_1
     */

    /**
     * @class Ink.UI.Table
     *
     * @since April 2013
     * @author ricardo.s.machado AT telecom.pt
     * @version 1
     *
     * <pre>
     * The Table component transforms the native/DOM table element into a
     * sortable, paginated component.
     * </pre>
     */

    /**
     * @constructor Ink.UI.Table.?
     * @param {String|DOMElement} selector
     * @param {Object}            options
     * @... {optional Number}               pageSize        Number of rows per page.
     * @... {optional String}               endpoint        Endpoint to get the records via AJAX
     */
    var Table = function( selector, options ){

        /**
         * Get the root element
         */
        this._rootElement = Aux.elOrSelector(selector, '1st argument');

        if( this._rootElement.nodeName.toLowerCase() !== 'table' ){
            throw '[Ink.UI.Table] :: The element is not a table';
        }

        this._options = Ink.extendObj({
            pageSize: undefined,
            endpoint: undefined
        },Element.data(this._rootElement));

        this._options = Ink.extendObj( this._options, options || {});

        /**
         * Initializing variables
         */
        this._handlers = {
            click: Ink.bindEvent(this._onClick,this)
        };
        this._sortableFields = {};
        this._originalData = this._data = [];
        this._headers = [];
        this._pagination = null;

        this._init();
    };

    Table.prototype = {

        _init: function(){
            /**
             * Setting the sortable columns and its event listeners
             */
            Event.observe(Selector.select('thead',this._rootElement)[0],'click',this._handlers.click);
            this._headers = Selector.select('thead tr th',this._rootElement);
            InkArray.each(this._headers,Ink.bind(function(item, index){
                var dataset = Element.data( item );
                if( ('sortable' in dataset) && (dataset.sortable.toString() === 'true') ){
                    this._sortableFields['col_' + index] = 'none';
                }
            },this));

            /**
             * Getting the table's data
             */
            InkArray.each(Selector.select('tbody tr',this._rootElement),Ink.bind(function(tr){
                this._data.push(tr);
            },this));
                this._originalData = this._data.slice(0);

            if( ("pageSize" in this._options) && (typeof this._options.pageSize !== 'undefined') ){
                /**
                 * Applying the pagination
                 */
                this._pagination = this._rootElement.nextSibling;
                while(this._pagination.nodeType !== 1){
                    this._pagination = this._pagination.nextSibling;
                }

                if( this._pagination.nodeName.toLowerCase() !== 'nav' ){
                    throw '[Ink.UI.Table] :: Missing the pagination markup or is mis-positioned';
                }

                this._pagination = new Pagination( this._pagination, {
                    size: Math.ceil(this._data.length/this._options.pageSize),
                    onChange: Ink.bind(function( pagingObj ){
                        this._paginate( (pagingObj._current+1) );
                    },this)
                });

                this._paginate(1);
            }
        },

        _onClick: function( event ){
            Event.stop(event);
            var
                tgtEl = Event.element(event),
                dataset = Element.data(tgtEl),
                index,i
            ;
            if( (tgtEl.nodeName.toLowerCase() !== 'th') || ( !("sortable" in dataset) || (dataset.sortable.toString() !== 'true') ) ){
                return;
            }

            index = -1;
            if( InkArray.inArray( tgtEl,this._headers ) ){
                for( i=0; i<this._headers.length; i++ ){
                    if( this._headers[i] === tgtEl ){
                        index = i;
                        break;
                    }
                }
            }

            if( index === -1){
                return;
            }

            if( this._sortableFields['col_'+index] === 'desc' )
            {
                this._headers[index].innerHTML = this._headers[index].innerText;
                this._sortableFields['col_'+index] = 'none';

                var found = false;
                for(var prop in this._sortableFields ){
                    if( this._sortableFields[prop] === 'asc' || this._sortableFields[prop] === 'desc' ){
                        found = true;
                        this._sort(prop.replace('col_',''));
                        break;
                    }
                }

                if( !found ){
                    this._data = this._originalData.slice(0);
                }
            } else {

                this._sort(index);

                if( this._sortableFields['col_'+index] === 'asc' )
                {
                    this._data.reverse();
                    this._sortableFields['col_'+index] = 'desc';
                    this._headers[index].innerHTML = this._headers[index].innerText + '<i class="icon-caret-down"></i>';
                } else {
                    this._sortableFields['col_'+index] = 'asc';
                    this._headers[index].innerHTML = this._headers[index].innerText + '<i class="icon-caret-up"></i>';

                }
            }


            var tbody = Selector.select('tbody',this._rootElement)[0];
            Aux.cleanChildren(tbody);
            InkArray.each(this._data,function(item){
                tbody.appendChild(item);
            });

            this._pagination.setCurrent(0);
            this._paginate(1);
        },

        _paginate: function( page ){
            InkArray.each(this._data,Ink.bind(function(item, index){
                if( (index >= ((page-1)*parseInt(this._options.pageSize,10))) && (index < (((page-1)*parseInt(this._options.pageSize,10))+parseInt(this._options.pageSize,10)) ) ){
                    Css.removeClassName(item,'hide-all');
                } else {
                    Css.addClassName(item,'hide-all');
                }
            },this));
        },

        _sort: function( index ){
            this._data.sort(Ink.bind(function(a,b){
                var
                    aValue = Selector.select('td',a)[index].innerText,
                    bValue = Selector.select('td',b)[index].innerText
                ;

                var regex = new RegExp(/\d/g);
                if( !isNaN(aValue) && regex.test(aValue) ){
                    aValue = parseInt(aValue,10);
                } else if( !isNaN(aValue) ){
                    aValue = parseFloat(aValue);
                }

                if( !isNaN(bValue) && regex.test(bValue) ){
                    bValue = parseInt(bValue,10);
                } else if( !isNaN(bValue) ){
                    bValue = parseFloat(bValue);
                }

                if( aValue === bValue ){
                    return 0;
                } else {
                    return ( ( aValue>bValue ) ? 1 : -1 );
                }
            },this));
        }
    };

    return Table;

});
