
Ink.createModule('Ink.UI.Spy', '1', ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1'], function(Aux, Event, Css, Element, Selector, InkArray ) {
    'use strict';

    var Spy = function( selector, options ){

        this._rootElement = Aux.elOrSelector(selector,'1st argument');

        /**
         * Setting default options and - if needed - overriding it with the data attributes
         */
        this._options = Ink.extendObj({
            target: undefined,
            offset: '20px'
        }, Element.data( this._rootElement ) );

        /**
         * In case options have been defined when creating the instance, they've precedence
         */
        this._options = Ink.extendObj(this._options,options || {});

        this._options.target = Aux.elOrSelector( this._options.target, 'Target' );

        this._scrollTimeout = null;
        this._init();
    };

    Spy.prototype = {

        _elements: [],
        _init: function(){
            Event.observe( document, 'scroll', Ink.bindEvent(this._onScroll,this) );
            this._elements.push(this._rootElement);
        },

        _onScroll: function(){

            if(
                (window.scrollY <= this._rootElement.offsetTop)
            ){
                return;
            } else {
                for( var i = 0; i < this._elements.length; i++ ){
                    if( (this._elements[i].offsetTop <= window.scrollY) && (this._elements[i] !== this._rootElement) && (this._elements[i].offsetTop > this._rootElement.offsetTop) ){
                        return;
                    }
                }
            }


            // if( this._scrollTimeout ){
            //     clearTimeout(this._scrollTimeout);
            // }
            // this._scrollTimeout = setTimeout(function(){

                InkArray.each(
                    Selector.select(
                        'a',
                        this._options.target
                    ),Ink.bind(function(item){

                        var comparisonValue = ( ("href" in this._rootElement) && this._rootElement.href ?
                            this._rootElement.href.substr(this._rootElement.href.indexOf('#') )
                            : '#' + this._rootElement.id
                        );

                        if( item.href.substr(item.href.indexOf('#')) === comparisonValue ){
                            Css.addClassName(Element.findUpwardsByTag(item,'li'),'active');
                        } else {
                            Css.removeClassName(Element.findUpwardsByTag(item,'li'),'active');
                        }
                    },this)
                );

            //     this._scrollTimeout = undefined;
            // }.bindObj(this),100);
        },

        _destroy: function(){

        }

    };

    return Spy;

});
