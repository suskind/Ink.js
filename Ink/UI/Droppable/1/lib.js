/**
 * @module Ink.UI.Droppable_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule("Ink.UI.Droppable","1",["Ink.Dom.Element_1", "Ink.Dom.Event_1", "Ink.Dom.Css_1", "Ink.UI.Aux_1", "Ink.Util.Array_1"], function( InkElement, InkEvent, Css, Aux, InkArray) {
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
         * Array with the data of each element (`{element: ..., data: ..., options: ...}`)
         * 
         * @property _elements
         * @type {Arrag}
         * @private
         */
        _elements: [], // indexed by id

        /**
         * Makes an element droppable and adds it to the stack of droppable elements.
         * Can consider it a constructor of droppable elements, but where no Droppable object is returned.
         * 
         * @method add
         * @param {String|DOMElement}       element     Target element
         * @param {Object}                  [options]   options object
         *     @param {String}       [options.hoverClass] Classname applied when an acceptable draggable element is hovering the element
         *     @param {Array|String} [options.accept]   Array or space separated string of classnames for elements that can be accepted by this droppable
         *     @param {Function}     [options.onHover]  callback called when an acceptable draggable element is hovering the droppable. Gets the draggable and the droppable element as parameters.
         *     @param {Function}     [options.onDrop]   callback called when an acceptable draggable element is dropped. Gets the draggable, the droppable and the event as parameters.
         *     @param {Function}     [options.onDropOut] callback called when a droppable is dropped outside this droppable. Gets the draggable, the droppable and the event as parameters.
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

            var elementData = {
                element: element,
                data: {},
                options: opt
            };
            this._elements.push(elementData);
            this._update(elementData);
        },
        
        /**
         * Find droppable data about `element`. This data is added in `.add`
         */
        _findData: function (element) {
            var elms = this._elements;
            for (var i = 0, len = elms.length; i < len; i++) {
                if (elms[i] === element) {
                    return elms[i];
                }
            }
        },

        /**
         * Invoke every time a drag starts
         * 
         * @method updateAll
         * @public
         */
        updateAll: function() {
            InkArray.each(this._elements, Droppable._update);
        },

        /**
         * Updates location and size of droppable element
         * 
         * @method update
         * @param {String|DOMElement} element - target element
         * @public
         */
        update: function(element) {
            this._update(this._findData(element));
        },

        _update: function(elementData) {
            var data = elementData.data;
            var element = elementData.element;
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
         * @return {Boolean} Whether the object was found and deleted
         * @public
         */
        remove: function(el) {
            el = Aux.elOrSelector(el);
            var len = this._elements.length;
            for (var i = 0, len = this._elements.length; i < len; i++) {
                if (this._elements[i].element === el) {
                    this._elements.splice(i, 1);
                    break;
                }
            }
            return len !== this._elements.length;
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
            var opt,
                acceptable,
                accept,
                el,
                element,
                classes;

            // check all droppable elements
            for (var i = 0, len = this._elements.length; i < len; i++) {
                el = this._elements[i].data;
                opt = this._elements[i].options;
                accept = false;
                element = this._elements[i].element;

                // check if our draggable is over our droppable
                if (coords.x >= el.left && coords.x <= el.right &&
                        coords.y >= el.top && coords.y <= el.bottom) {
                    // INSIDE

                    // check if the droppable accepts the draggable
                    if (opt.accept) {
                        acceptable = opt.accept.split(/ +/);
                        accept = !!InkArray.some(acceptable,
                            Ink.bind(Css.hasClassName, Css, draggable));
                    } else {
                        accept = true;
                    }

                    if (accept) {
                        if (type === 'drag') {
                            if (opt.hoverClass) {
                                classes = opt.hoverClass.split(/ +/);
                                InkArray.each(classes,
                                    Ink.bind(Css.addClassName, Css, element));
                            }
                            if (opt.onHover) {
                                opt.onHover(draggable, element);
                            }
                        } else {
                            if (type === 'drop' && opt.onDrop) {
                                if (opt.hoverClass) {
                                    classes = opt.hoverClass.split(/ +/);
                                    InkArray.each(classes,
                                        Ink.bind(Css.removeClassName, Css, element));
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
                        InkArray.each(opt.hoverClass.split(/ +/),
                            Ink.bind(Css.removeClassName, Css, element));
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
