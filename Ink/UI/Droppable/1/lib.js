/**
 * @module Ink.UI.Droppable_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule("Ink.UI.Droppable","1",["Ink.Dom.Element_1", "Ink.Dom.Event_1", "Ink.Dom.Css_1", "Ink.UI.Aux_1"], function( InkElement, InkEvent, Css, Aux) {

    /**
     * @class Ink.UI.Droppable
     * @version 1
     * @static
     */
    var Droppable = {
        /**
         * Flag that determines if it's in debug mode or not
         *
         * @property debug
         * @type {Boolean}
         * @private
         */
        debug: false,

        /**
         * Associative array with the elements that are droppable
         * 
         * @property _elements
         * @type {Object}
         * @private
         */
        _elements: {}, // indexed by id

        /**
         * Makes an element droppable and adds it to the stack of droppable elements.
         * Can consider it a constructor of droppable elements, but where no Droppable object is returned.
         * 
         * @method add
         * @param {String|DOMElement}       element    Target element
         * @param {Object}                  [options]  options object
         *     @param {String}       [options.hoverClass] Classname applied when an acceptable draggable element is hovering the element
         *     @param {Array|String} [options.accept]     Array or comma separated string of classnames for elements that can be accepted by this droppable
         *     @param {Function}     [options.onHover]    callback called when an acceptable draggable element is hovering the droppable. Gets the draggable and the droppable element as parameters.
         *     @param {Function}     [options.onDrop]     callback called when an acceptable draggable element is dropped. Gets the draggable, the droppable and the event as parameters.
         *     @param {Function}     [options.onDropOut]  callback called when a droppable is dropped outside this droppable. Gets the draggable, the droppable and the event as parameters.
         * @public
         */
        add: function(element, options) {
            element = Aux.elOrSelector(element, 'Droppable.add target element');

            var opt = Ink.extendObj( {
                hoverClass:     options.hoverclass /* old name */ || false,
                accept:         false,
                onHover:        false,
                onDrop:         false,
                onDropOut:      false                
            }, options || {}, InkElement.data(element));

            if (opt.accept && opt.accept.constructor === Array) {
                opt.accept = opt.accept.join();
            }

            this._elements[element.id] = {options: opt};
            this.update(element.id);
        },

        /**
         * Invoke every time a drag starts
         * 
         * @method updateAll
         * @public
         */
        updateAll: function() {
            for (var id in this._elements) {
                if (!this._elements.hasOwnProperty(id)) {    continue;    }
                this.update(Ink.i(id));
            }
        },

        /**
         * Updates location and size of droppable element
         * 
         * @method update
         * @param {String|DOMElement} element - target element
         * @public
         */
        update: function(element) {
            element = Ink.i(element);
            var data = this._elements[element.id];
            if (!data) {
                return; /*throw 'Data about element with id="' + element.id + '" was not found!';*/
            }

            data.left   = InkElement.offsetLeft(element);
            data.top    = InkElement.offsetTop( element);
            data.right  = data.left + InkElement.elementWidth( element);
            data.bottom = data.top  + InkElement.elementHeight(element);
        },

        /**
         * Removes an element from the droppable stack and removes the droppable behavior
         * 
         * @method remove
         * @param {String|DOMElement} elOrSelector  Droppable element to disable.
         * @public
         */
        remove: function(el) {
            el = Aux.elOrSelector(el);
            delete this._elements[el.id];
        },

        /**
         * Method called by a draggable to execute an action on a droppable
         * 
         * @method action
         * @param {Object} coords    coordinates where the action happened
         * @param {String} type      type of action. drag or drop.
         * @param {Object} ev        Event object
         * @param {Object} draggable draggable element
         * @public
         */
        action: function(coords, type, ev, draggable) {
            var opt, classnames, accept, el, element;

            // check all droppable elements
            for (var elId in this._elements) {
                if (!this._elements.hasOwnProperty(elId)) {    continue;    }
                el = this._elements[elId];
                opt = el.options;
                accept = false;
                element = Ink.i(elId);

                // check if our draggable is over our droppable
                if (coords.x >= el.left && coords.x <= el.right && coords.y >= el.top && coords.y <= el.bottom) {

                    // INSIDE

                    // check if the droppable accepts the draggable
                    if (opt.accept) {
                        classnames = draggable.className.split(' ');
                        for ( var j = 0, lj = classnames.length; j < lj; j++) {
                            if (opt.accept.search(classnames[j]) >= 0 && draggable !== element) {
                                accept = true;
                            }
                        }
                    }
                    else {
                        accept = true;
                    }

                    if (accept) {
                        if (type === 'drag') {
                            if (opt.hoverClass) {
                                Css.addClassName(element, opt.hoverClass);
                            }
                            if (opt.onHover) {
                                opt.onHover(draggable, element);
                            }
                        }
                        else {
                            if (type === 'drop' && opt.onDrop) {
                                if (opt.hoverClass) {
                                    Css.removeClassName(element, opt.hoverClass);
                                }
                                if (opt.onDrop) {
                                    opt.onDrop(draggable, element, ev);
                                }
                            }
                        }
                    }
                }
                else {
                    // OUTSIDE
                    if (type === 'drag' && opt.hoverClass) {
                        Css.removeClassName(element, opt.hoverClass);
                    }
                    if(type === 'drop'){
                        if(opt.onDropOut){
                            opt.onDropOut(draggable, element, ev);
                        }
                    }
                }
            }
        }
    };

    return Droppable;
});
