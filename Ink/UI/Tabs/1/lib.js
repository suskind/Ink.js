
Ink.createModule('Ink.UI.Tabs', '1',
    ['Ink.UI.Aux_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1'],
    function(Aux, Event, Css, Element, Selector, InkArray) {

    'use strict';

    /**
     * @module Ink.UI.Tabs_1
     */

    /**
     * @class Ink.UI.Tabs
     *
     * @since November 2012
     * @author andre.padez AT co.sapo.pt
     * @version 0.1
     *
     * Tabs component.
     */

    /**
     * @constructor Ink.UI.Tabs.?
     * @param {String|DOMElement} selector
     * @param {Object}            options
     * @... {optional: Boolean}      preventUrlChange        Flag that determines if follows the link on click or stops the event
     * @... {optional: String}       active                  ID of the tab to activate on creation
     * @... {optional: Array}        disabled                IDs of the tabs that will be disabled on creation
     * @... {optional: Function}     onBeforeChange          callback to be executed before changing tabs
     * @... {optional: Function}     onChange                callback to be executed after changing tabs
     */
    var Tabs = function(selector, options) {

        if (!Aux.isDOMElement(selector)) {
            selector = Selector.select(selector);
            if (selector.length === 0) { throw new TypeError('1st argument must either be a DOM Element or a selector expression!'); }
            this._element = selector[0];
        } else {
            this._element = selector;
        }


        this._options = Ink.extendObj({
            preventUrlChange: false,
            active: undefined,
            disabled: [],
            onBeforeChange: undefined,
            onChange: undefined
        }, Element.data(selector));

        this._options = Ink.extendObj(this._options,options || {});

        this._handlers = {
            tabClicked: Ink.bindEvent(this._onTabClicked,this),
            disabledTabClicked: Ink.bindEvent(this._onDisabledTabClicked,this),
            resize: Ink.bindEvent(this._onResize,this)
        };

        this._init();
    };

    Tabs.prototype = {

        _init: function() {
            this._menu = Selector.select('.tabs-nav', this._element)[0];
            this._menuTabs = this._getChildElements(this._menu);
            this._contentTabs = Selector.select('.tabs-content', this._element);

            //initialization of the tabs, hides all content before setting the active tab
            this._initializeDom();

            // subscribe events
            this._observe();

            //sets the first active tab
            this._setFirstActive();

            //shows the active tab
            this._changeTab(this._activeMenuLink);

            this._handlers.resize();

            Aux.registerInstance(this, this._element, 'tabs');
        },

        _initializeDom: function(){
            for(var i = 0; i < this._contentTabs.length; i++){
                Css.hide(this._contentTabs[i]);
            }
        },

        _observe: function() {
            InkArray.each(this._menuTabs,Ink.bind(function(elem){
                var link = Selector.select('a', elem)[0];
                if(InkArray.inArray(link.getAttribute('href'), this._options.disabled)){
                    this.disable(link);
                } else {
                    this.enable(link);
                }
            },this));

            Event.observe(window, 'resize', this._handlers.resize);
        },

        /**
         * @function ? run at instantiation, to determine which is the first active tab
         * fallsback from window.location.href to options.active to the first not disabled tab
         */
        _setFirstActive: function() {
            var hash = window.location.hash;
            this._activeContentTab = Selector.select(hash, this._element)[0] ||
                                     Selector.select(this._hashify(this._options.active), this._element)[0] ||
                                     Selector.select('.tabs-content', this._element)[0];

            this._activeMenuLink = this._findLinkByHref(this._activeContentTab.getAttribute('id'));
            this._activeMenuTab = this._activeMenuLink.parentNode;
        },

        /**
         * @function ? changes to the desired tab
         * @param {DOMElement} link             anchor linking to the content container
         * @param {boolean}    runCallbacks     defines if the callbacks should be run or not
         */
        _changeTab: function(link, runCallbacks){
            if(runCallbacks && typeof this._options.onBeforeChange !== 'undefined'){
                this._options.onBeforeChange(this);
            }

            var selector = link.getAttribute('href');
            Css.removeClassName(this._activeMenuTab, 'active');
            Css.removeClassName(this._activeContentTab, 'active');
            Css.addClassName(this._activeContentTab, 'hide-all');

            this._activeMenuLink = link;
            this._activeMenuTab = this._activeMenuLink.parentNode;
            this._activeContentTab = Selector.select(selector.substr(selector.indexOf('#')), this._element)[0];

            Css.addClassName(this._activeMenuTab, 'active');
            Css.addClassName(this._activeContentTab, 'active');
            Css.removeClassName(this._activeContentTab, 'hide-all');
            Css.show(this._activeContentTab);

            if(runCallbacks && typeof(this._options.onChange) !== 'undefined'){
                this._options.onChange(this);
            }
        },

        /**
         * @function ? tab clicked handler
         * @param {Event} ev
         */
        _onTabClicked: function(ev) {
            Event.stop(ev);
            //var target = Event.element(ev);
            var target = Event.findElement(ev, 'A');
            if(target.nodeName.toLowerCase() !== 'a') {
                return;
            }

            if( this._options.preventUrlChange.toString() !== 'true'){
                window.location.hash = target.getAttribute('href').substr(target.getAttribute('href').indexOf('#'));
            }

            if(target === this._activeMenuLink){
                return;
            }
            this.changeTab(target);
        },

        /**
         * @function ? disabled tab clicked handler
         * @param {Event} ev
         */
        _onDisabledTabClicked: function(ev) {
            Event.stop(ev);
        },

        _onResize: function(){
            var currentLayout = Aux.currentLayout();
            if(currentLayout === this._lastLayout){
                return;
            }

            if(currentLayout === Aux.Layouts.SMALL || currentLayout === Aux.Layouts.MEDIUM){
                Css.removeClassName(this._menu, 'menu');
                Css.removeClassName(this._menu, 'horizontal');
                // Css.addClassName(this._menu, 'pills');
            } else {
                Css.addClassName(this._menu, 'menu');
                Css.addClassName(this._menu, 'horizontal');
                // Css.removeClassName(this._menu, 'pills');
            }
            this._lastLayout = currentLayout;
        },

        /*****************
         * Aux Functions *
         *****************/

        /**
         * @function ? allows the hash to be passed with or without the cardinal sign
         * @param {String} hash     the string to be hashified
         */
        _hashify: function(hash){
            if(!hash){
                return "";
            }
            return hash.indexOf('#') === 0? hash : '#' + hash;
        },

        /**
         * @function ? returns the anchor with the desired href
         * @param {String} href     the href to be found on the returned link
         */
        _findLinkByHref: function(href){
            href = this._hashify(href);
            var ret;
            InkArray.each(this._menuTabs,Ink.bind(function(elem){
                var link = Selector.select('a', elem)[0];
                if( (link.getAttribute('href').indexOf('#') !== -1) && ( link.getAttribute('href').substr(link.getAttribute('href').indexOf('#')) === href ) ){
                    ret = link;
                }
            },this));
            return ret;
        },

        _getChildElements: function(parent){
            var childNodes = [];
            var children = parent.children;
            for(var i = 0; i < children.length; i++){
                if(children[i].nodeType === 1){
                    childNodes.push(children[i]);
                }
            }
            return childNodes;
        },

        /**************
         * PUBLIC API *
         **************/

        /**
         * @function ? changes to the desired tag
         * @param {String|DOMElement} selector      the id of the desired tab or the link that links to it
         */
        changeTab: function(selector) {
            var element = (selector.nodeType === 1)? selector : this._findLinkByHref(this._hashify(selector));
            if(!element || Css.hasClassName(element, 'ink-disabled')){
                return;
            }
            this._changeTab(element, true);
        },

        /**
         * @function ? disables the desired tag
         * @param {String|DOMElement} selector      the id of the desired tab or the link that links to it
         */
        disable: function(selector){
            var element = (selector.nodeType === 1)? selector : this._findLinkByHref(this._hashify(selector));
            if(!element){
                return;
            }
            Event.stopObserving(element, 'click', this._handlers.tabClicked);
            Event.observe(element, 'click', this._handlers.disabledTabClicked);
            Css.addClassName(element, 'ink-disabled');
        },

         /**
         * @function ? enables the desired tag
         * @param {String|DOMElement} selector      the id of the desired tab or the link that links to it
         */
        enable: function(selector){
            var element = (selector.nodeType === 1)? selector : this._findLinkByHref(this._hashify(selector));
            if(!element){
                return;
            }
            Event.stopObserving(element, 'click', this._handlers.disabledTabClicked);
            Event.observe(element, 'click', this._handlers.tabClicked);
            Css.removeClassName(element, 'ink-disabled');
        },

        /***********
         * Getters *
         ***********/

        activeTab: function(){
            return this._activeContentTab.getAttribute('id');
        },

        /**
         * @function ? returns the current active Menu LI
         */
        activeMenuTab: function(){
            return this._activeMenuTab;
        },
        /**
         * @function ? returns the current active Menu anchor
         */
        activeMenuLink: function(){
            return this._activeMenuLink;
        },
        /**
         * @function ? returns the current active Content Tab
         */
        activeContentTab: function(){
            return this._activeContentTab;
        },

        /**
         * @function ? unregisters the component and removes its markup from the DOM
         */
        destroy: Aux.destroyComponent
    };

    return Tabs;

});
