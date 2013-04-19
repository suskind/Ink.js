
Ink.createModule('Ink.UI.TreeView', '1',
    ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1'],
    function(Aux, Event, Css, Element, Selector, InkArray) {

    'use strict';

    /**
     * @module Ink.UI.TreeView_1
     */

    /**
     * @class Ink.UI.TreeView
     *
     * @since April 2013
     * @author ricardo.s.machado AT telecom.pt
     * @version 1
     *
     * <pre>
     * TreeView is an Ink's component responsible for presenting a defined set of elements in a tree-like hierarchical structure
     * </pre>
     *
     * @param {string|DOMElement} selector CSS Selector or DOMElement
     * @param {Object}            options
     * @... {optional String}               node        CSS selector that identifies the elements that are considered nodes.
     * @... {optional String}               child       CSS selector that identifies the elements that are children of those nodes.
     */
    var TreeView = function(selector, options){

        /**
         * Gets the element
         */
        if( !Aux.isDOMElement(selector) && (typeof selector !== 'string') ){
            throw '[Ink.UI.TreeView] :: Invalid selector';
        } else if( typeof selector === 'string' ){
            this._element = Selector.select( selector );
            if( this._element.length < 1 ){
                throw '[Ink.UI.TreeView] :: Selector has returned no elements';
            }
            this._element = this._element[0];
        } else {
            this._element = selector;
        }

        /**
         * Default options and they're overrided by data-attributes if any.
         * The parameters are:
         * @param {string} node Selector to define which elements are seen as nodes. Default: li
         * @param {string} child Selector to define which elements are represented as childs. Default: ul
         */
        this._options = Ink.extendObj({
            node:   'li',
            child:  'ul'
        },Element.data(this._element));

        this._options = Ink.extendObj(this._options, options || {});

        this._init();
    };

    TreeView.prototype = {

        /**
         * @function {void} ? Sets the necessary event handlers.
         * @return {void}
         */
        _init: function(){

            this._handlers = {
                click: Ink.bindEvent(this._onClick,this)
            };

            Event.observe(this._element, 'click', this._handlers.click);

            var
                nodes = Selector.select(this._options.node,this._element),
                children
            ;
            InkArray.each(nodes,Ink.bind(function(item){
                if( Css.hasClassName(item,'open') )
                {
                    return;
                }

                if( !Css.hasClassName(item, 'closed') ){
                    Css.addClassName(item,'closed');
                }

                children = Selector.select(this._options.child,item);
                InkArray.each(children,Ink.bind(function( inner_item ){
                    if( !Css.hasClassName(inner_item, 'hide-all') ){
                        Css.addClassName(inner_item,'hide-all');
                    }
                },this));
            },this));

        },

        /**
         * @function {void} ? Handles the click event (as specified in the _init function)
         * @return {void}
         */
        _onClick: function(event){

            /**
             * Summary:
             * If the clicked element is a "node" as defined in the options, will check if it has any "child".
             * If so, will show it or hide it, depending on its current state. And will stop the event's default behavior.
             * If not, will execute the event's default behavior.
             *
             */
            var tgtEl = Event.element(event);

            if( this._options.node[0] === '.' ) {
                if( !Css.hasClassName(tgtEl,this._options.node.substr(1)) ){
                    while( (!Css.hasClassName(tgtEl,this._options.node.substr(1))) && (tgtEl.nodeName.toLowerCase() !== 'body') ){
                        tgtEl = tgtEl.parentNode;
                    }
                }
            } else if( this._options.node[0] === '#' ){
                if( tgtEl.id !== this._options.node.substr(1) ){
                    while( (tgtEl.id !== this._options.node.substr(1)) && (tgtEl.nodeName.toLowerCase() !== 'body') ){
                        tgtEl = tgtEl.parentNode;
                    }
                }
            } else {
                if( tgtEl.nodeName.toLowerCase() !== this._options.node ){
                    while( (tgtEl.nodeName.toLowerCase() !== this._options.node) && (tgtEl.nodeName.toLowerCase() !== 'body') ){
                        tgtEl = tgtEl.parentNode;
                    }
                }
            }

            if(tgtEl.nodeName.toLowerCase() === 'body'){ return; }

            var child = Selector.select(this._options.child,tgtEl);
            if( child.length > 0 ){
                Event.stop(event);
                child = child[0];
                if( Css.hasClassName(child,'hide-all') ){ Css.removeClassName(child,'hide-all'); Css.addClassName(tgtEl,'open'); Css.removeClassName(tgtEl,'closed'); }
                else { Css.addClassName(child,'hide-all'); Css.removeClassName(tgtEl,'open'); Css.addClassName(tgtEl,'closed'); }
            }

        }

    };

    return TreeView;

});
