/**
 * @author inkdev AT sapo.pt
 */

Ink.createModule('Ink.UI.Aux', '1',
    ['Ink.Net.Ajax_1','Ink.Dom.Css_1','Ink.Dom.Selector_1','Ink.Util.Url_1'],
    function(Ajax, Css, Selector, Url) {

    'use strict';

    /**
     * @module Ink.UI.Aux_1
     */

    /**
     * Auxiliar Utility functions to use with several components
     *
     * @namespace Ink.UI.Aux
     */

    var instances = {};
    var lastIdNum = 0;
    var Aux = {

        /**
         * @property ? supported ink layouts
         */
        Layouts: {
            SMALL:  's',
            MEDIUM: 'm',
            LARGE:  'l'
        },

        /**
         * @function {Boolean} ? returns true iif o is a DOM Element
         * @param {any} o
         */
        isDOMElement: function(o) {
            return (typeof o === 'object' && 'nodeType' in o && o.nodeType === 1);
        },

        /**
         * @function {Boolean} ? returns true iif n is an integer number
         * @param {any} n
         */
        isInteger: function(n) {
            return (typeof n === 'number' && n % 1 === 0);
        },

        /**
         * @function {DOMElement} ? applies the Sizzle selector/document.querySelectorAll if string, just returns element otherwise
         * @param  {DOMElement|String} elOrSelector accepts a DOMElement or a CSS selector string
         * @param  {String}            fieldName    the name the field occupies on the
         */
        elOrSelector: function(elOrSelector, fieldName) {
            if (!this.isDOMElement(elOrSelector)) {
                var t = Selector.select(elOrSelector);
                if (t.length === 0) { throw new TypeError(fieldName + ' must either be a DOM Element or a selector expression!\nThe script element must also be after the DOM Element itself.'); }
                return t[0];
            }
            return elOrSelector;
        },

        /**
         * @function {Object} ? returns a deep copy of an object. it can't have loops
         * @param  {Object} o
         */
        clone: function(o) {
            try {
                if (typeof o !== 'object') { throw new Error('Given argument is not an object!'); }
                return JSON.parse( JSON.stringify(o) );
            } catch (ex) {
                throw new Error('Given object cannot have loops!');
            }
        },

        /**
         * @function {Number} ? returns the nth position the given element occupies relatively to its parent
         * @param  {DOMElement} childEl
         */
        childIndex: function(childEl) {
            var els = Selector.select('> *', childEl.parentNode);
            for (var i = 0, f = els.length; i < f; ++i) {
                if (els[i] === childEl) {
                    return i;
                }
            }
            throw 'not found!';
        },

        /**
         * @function ? for convenience, this methods does an AJAX request and offers a cb(err, jsonData) interface for easy async handling
         * @param  {String}   endpoint the endpoint URI
         * @param  {Object}   params   hash of param names -> values to pass
         * @param  {Function} cb       function(err, data). null is passed on err if no err occurred.
         */
        ajaxJSON: function(endpoint, params, cb) {
            new Ajax(
                endpoint,
                {
                    evalJS:         'force',
                    method:         'POST',
                    parameters:     params,

                    onSuccess:  function( r) {
                        try {
                            r = r.responseJSON;
                            if (r.status !== 'ok') {
                                throw 'server error: ' + r.message;
                            }
                            cb(null, r);
                        } catch (ex) {
                            cb(ex);
                        }
                    },

                    onFailure: function() {
                        cb('communication failure');
                    }
                }
            );
        },

        /**
         * @function {String} ? returns the current ink layout being applied
         */
        currentLayout: function() {
            var i, f, k, v, el, detectorEl = Selector.select('#ink-layout-detector')[0];
            if (!detectorEl) {
                detectorEl = document.createElement('div');
                detectorEl.id = 'ink-layout-detector';
                for (k in this.Layouts) {
                    if (this.Layouts.hasOwnProperty(k)) {
                        v = this.Layouts[k];
                        el = document.createElement('div');
                        el.className = 'ink-for-' + v;
                        el.setAttribute('data-ink-layout', v);
                        detectorEl.appendChild(el);
                    }
                }
                document.body.appendChild(detectorEl);
            }

            for (i = 0, f = detectorEl.childNodes.length; i < f; ++i) {
                el = detectorEl.childNodes[i];
                if (Css.getStyle(el, 'visibility') !== 'hidden') {
                    return el.getAttribute('data-ink-layout');
                }
            }
        },

        /**
         * @function ? non-destructive set of hash parameters
         * @param {Object} o object to index parameters and values to change on the hash. if other parameters were there, they are kept the same.
         */
        hashSet: function(o) {
            if (typeof o !== 'object') { throw new TypeError('o should be an object!'); }
            var hashParams = Url.getAnchorString();
            hashParams = Ink.extendObj(hashParams, o);
            window.location.hash = Url.genQueryString('', hashParams).substring(1);
        },


        /**
         * @function ? IE8 doesn't like table.innerHTML = ''
         * @param  {DOMElement} el
         */
        cleanChildren: function(parentEl) {
            var prevEl, el = parentEl.lastChild;
            while (el) {
                prevEl = el.previousSibling;
                parentEl.removeChild(el);
                el = prevEl;
            }
        },

        /**
         * @function ? saves id and classes on fromEl as private attributes of inObj if present.
         * @param  {DOMElement} fromEl
         * @param  {Object}     inObj
         */
        storeIdAndClasses: function(fromEl, inObj) {
            var id = fromEl.id;
            if (id) {
                inObj._id = id;
            }

            var classes = fromEl.className;
            if (classes) {
                inObj._classes = classes;
            }
        },

        /**
         * @function ? recovers id and classes to toEl from private attributes of inObj if present.
         * @param  {DOMElement} toEl
         * @param  {Object}     inObj
         */
        restoreIdAndClasses: function(toEl, inObj) {
            if (inObj._id && toEl.id !== inObj._id) {
                toEl.id = inObj._id;
            }

            if (inObj._classes && toEl.className.indexOf(inObj._classes) === -1) {
                if (toEl.className) { toEl.className += ' ' + inObj._classes; }
                else {                toEl.className  =       inObj._classes; }
            }

            if (inObj._instanceId && !toEl.getAttribute('data-instance')) {
                toEl.setAttribute('data-instance', inObj._instanceId);
            }
        },

        /**
         * @function ? saves component instance reference for later retrieval
         * @param  {Object}           inst            JS object instance
         * @param  {DOMElement}       el              DOM Element to associate with the JS object
         * @param  {optional String}  optionalPrefix  defaults to 'instance'
         */
        registerInstance: function(inst, el, optionalPrefix) {
            if (inst._instanceId) { return; }

            if (typeof inst !== 'object') { throw new TypeError('1st argument must be a JavaScript object!'); }

            if (inst._options && inst._options.skipRegister) { return; }

            if (!this.isDOMElement(el)) { throw new TypeError('2nd argument must be a DOM element!'); }
            if (optionalPrefix !== undefined && typeof optionalPrefix !== 'string') { throw new TypeError('3rd argument must be a string!'); }
            var id = (optionalPrefix || 'instance') + (++lastIdNum);
            instances[id] = inst;
            inst._instanceId = id;
            var dataInst = el.getAttribute('data-instance');
            dataInst = (dataInst !== null) ? [dataInst, id].join(' ') : id;
            el.setAttribute('data-instance', dataInst);
        },

        /**
         * @function ? unregisters a component - useful only for volatile stuff such as modals
         * @param {String} id
         */
        unregisterInstance: function(id) {
            delete instances[id];
        },

        /**
         * @function ? auxiliary method - returns registered instance from a CSS selector rule
         * @param {String} selector
         */
        getInstanceFromSelector: function(selector) {
            var el = Selector.select(selector)[0];
            if (!el) { throw new Error('Element not found!'); }
            return this.getInstance(el);
        },

        /**
         * @function {Object|Object[]} ? returns an instance or several instances (if more than 1 instance is associated with the element)
         * @param  {String|DOMElement} instanceIdOrElement
         */
        getInstance: function(instanceIdOrElement) {
            var ids;
            if (this.isDOMElement(instanceIdOrElement)) {
                ids = instanceIdOrElement.getAttribute('data-instance');
                if (ids === null) { throw new Error('argument is not a DOM instance element!'); }
            }
            else {
                ids = instanceIdOrElement;
            }

            ids = ids.split(' ');
            var inst, id, i, l = ids.length;

            var res = [];
            for (i = 0; i < l; ++i) {
                id = ids[i];
                if (!id) { throw new Error('Element is not a JS instance!'); }
                inst = instances[id];
                if (!inst) { throw new Error('Instance "' + id + '" not found!'); }
                res.push(inst);
            }

            return (l === 1) ? res[0] : res;
        },

        /**
         * @function {String[]} ? returns all registered instance ids
         */
        getInstanceIds: function() {
            var res = [];
            for (var id in instances) {
                if (instances.hasOwnProperty(id)) {
                    res.push( id );
                }
            }
            return res;
        },

        /**
         * @function {Object[]} ? returns all regitered instances
         */
        getInstances: function() {
            var res = [];
            for (var id in instances) {
                if (instances.hasOwnProperty(id)) {
                    res.push( instances[id] );
                }
            }
            return res;
        },

        /**
         * @function ? not to be invoked from Aux. Components should copy this method as its destroy method.
         */
        destroyComponent: function() {
            Ink.Util.Aux.unregisterInstance(this._instanceId);
            this._element.parentNode.removeChild(this._element);
        }

    };

    return Aux;

});
