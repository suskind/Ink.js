/**
 * @module Ink.UI.Tooltip_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Tooltip', '1', ['Ink.UI.Aux_1', 'Ink.Dom.Event_1', 'Ink.Dom.Element_1', 'Ink.Dom.Selector_1', 'Ink.Dom.Browser_1'], function (Aux, InkEvent, InkElement, Selector) {
    'use strict';

    /**
     * @class Tooltip
     * @version 1
     */
    function Tooltip (element, options) {
        this._init(element, options || {});
    }

    function ok(v) {  // Sanity check. TODO remove
        if (!v) {throw new Error(v);}
    }

    Tooltip.prototype = {
        _oppositeDirections: {
            left: 'right',
            right: 'left',
            up: 'down',
            down: 'up'
        },
        _init: function(element, options) {
            var elements;

            this.sto = false;

            this.options = Ink.extendObj({
                    //elementAttr: 'element',
                    where: 'up',
                    zIndex: 10000,
                    hasText: true,
                    left: 10,
                    top: 10,
                    spacing: 8,
                    delay: 0,
                    color: '',
                    template: null,
                    templatefield: null,
                    text: '',
                }, options || {});

            if (typeof element === 'string') {
                elements = Selector.select(element);
            } else if (typeof element === 'object') {
                elements = [element];
            } else {
                throw 'Element expected';
            }

            this.elements = new Array(elements.length);

            for (var i = 0, len = elements.length; i < len; i++) {
                this.elements[i] = this._initEach(elements[i], i);
            }
        },
        _initEach: function(elm, index) {
            InkEvent.observe(elm, 'mouseover', Ink.bindEvent(this.onMouseOver, this, index));
            InkEvent.observe(elm, 'mouseout', Ink.bindEvent(this.onMouseOut, this, index));
            InkEvent.observe(elm, 'mousemove', Ink.bindEvent(this.onMouseMove, this, index));

            return {
                element: elm,
                options: this.options
            };
        },
        _makeTooltip: function (index, mouseEvent) {  // TODO refactor this into like 20 functions
            if (!this.elements[index]) {
                return;
            }

            if (this.elements[index].tooltip) {
                InkElement.remove(this.elements[index].tooltip);
            }
            var element = this.elements[index].element;
            var where = this._getOpt(index, 'where');

            var template = this._getOpt(index, 'template');  // User template instead of our HTML
            var templatefield = this._getOpt(index, 'templatefield');

            var tooltip,  // The element we float
                field;  // Element where we write our message. Child or same as the above

            if (template) {  // The user told us of a template to use. We copy it.
                var temp = document.createElement('DIV');
                temp.innerHTML = Aux.elOrSelector(template, 'options.template').outerHTML;
                tooltip = temp.firstChild;
                
                if (templatefield) {
                    field = Selector.select(templatefield, tooltip);
                    if (field) {
                        field = field[0];
                    } else {
                        throw 'options.templatefield must be a valid selector within options.template';
                    }
                } else {
                    field = tooltip;  // Assume same element if user did not specify a field
                }
            } else {  // We create the default structure
                tooltip = document.createElement('DIV');
                tooltip.setAttribute('class', 'ink-tooltip ' + this._getOpt(index, 'color'));
                field = document.createElement('DIV');
                field.setAttribute('class', 'content');

                var arrow = document.createElement('span');
                arrow.setAttribute('class', 'arrow ' + this._oppositeDirections[where] || 'left');

                tooltip.appendChild(field);
                tooltip.appendChild(arrow);
            }

            this.elements[index].tooltip = tooltip;
            InkElement.setTextContent(field, this._getOpt(index, 'text'));
            tooltip.style.display = 'block';
            tooltip.style.zIndex = this._getIntOpt(index, 'zIndex');
            
            if (where === 'mousemove' || where === 'mousefix') {
                tooltip.style.position = 'absolute';
                var mPos = this.getMousePosition(mouseEvent);
                this._setPos(index, mPos[0] + this._getIntOpt(index, 'left'), mPos[1] + this._getIntOpt(index, 'top'));
                if (document.documentElement) {
                    document.documentElement.appendChild(tooltip);
                }
            } else if (where.match(/(up|down|left|right)/)) {
                var target = this.elements[index].element;
                tooltip.style.position = 'absolute';
                this.elements[index].tooltip = tooltip;

                if (document.documentElement) {
                    document.documentElement.appendChild(tooltip);
                }
                
                var targetElementPos = InkElement.offset2(target);
                var tleft = targetElementPos[0],
                    ttop = targetElementPos[1];
                var centerh = (InkElement.elementWidth(target) / 2) - (InkElement.elementWidth(tooltip) / 2),
                    centerv = (InkElement.elementHeight(target) / 2) - (InkElement.elementHeight(tooltip) / 2);
                var spacing = this._getIntOpt(index, 'spacing');
                ok(tleft);ok(ttop);
                
                if (where === 'up') {
                    ttop -= InkElement.elementHeight(tooltip);
                    ttop -= spacing;
                    tleft += centerh;
                } else if (where === 'down') {
                    ttop += InkElement.elementHeight(target);
                    ttop += spacing;
                    tleft += centerh;
                } else if (where === 'left') {
                    tleft -= InkElement.elementWidth(tooltip);
                    tleft -= spacing;
                    ttop += centerv;
                } else if (where === 'right') {
                    tleft += InkElement.elementWidth(target);
                    tleft += spacing;
                    ttop += centerv;
                }
                tooltip.style.left = tleft + 'px';
                tooltip.style.top = ttop + 'px';
            }
        },
        _getOpt: function (index, option) {
            ok(index + 1);ok(option);
            var dataAttrVal = this.elements[index].element.getAttribute('data-tip-' + option);
            if (dataAttrVal /* null or "" may signify the absense of this attribute*/) {
                return dataAttrVal;
            }
            var optionVal = this.elements[index].options[option];
            if (typeof optionVal !== 'undefined') {
                return optionVal;
            }
            var instanceOption = this.options[option];
            if (typeof instanceOption !== 'undefined') {
                return instanceOption;
            }
            ok(false);
        },
        _getIntOpt: function (index, option) {
            return parseInt(this._getOpt(index, option), 10);
        },
        onMouseOver: function(e, index) {
            if(this.sto) {
                clearTimeout(this.sto);
            }
            
            var cb = Ink.bind(this._makeTooltip, this, index, e);
            this.sto = setTimeout(cb, this._getIntOpt(index, 'delay') * 1000);
            this.active = true;
        },

        onMouseOut: function(e, index) {
            var tooltp = this.elements[index].tooltip;
            if (tooltp) {
                InkElement.remove(tooltp);

                if(this.sto) {
                    clearTimeout(this.sto);
                    this.sto = false;
                }

                this.active = false;
            }
            this.elements[index].tooltip = null;
        },

        onMouseMove: function(e, index) {
            var tooltp = this.elements[index].tooltip;
            if (tooltp) {
                if (this._getOpt(index, 'where') === 'mousemove' && this.active) {
                    var mPos = this.getMousePosition(e);
                    this._setPos(index,
                        mPos[0] + this._getIntOpt(index, 'left'),
                        mPos[1] + this._getIntOpt(index, 'top'));
                }
            }
        },

        _setPos: function(index, left, top) {
            var pageDims = this._getPageXY();
            var tooltp = this.elements[index].tooltip;
            if (tooltp) {
                var elmDims = [InkElement.elementWidth(tooltp), InkElement.elementHeight(tooltp)];
                var scrollDim = this.getScroll();

                if((elmDims[0] + left - scrollDim[0]) >= (pageDims[0] - 20)) {
                    left = (left - elmDims[0] - this._getIntOpt(index, 'left') - 10);
                }
                if((elmDims[1] + top - scrollDim[1]) >= (pageDims[1] - 20)) {
                    top = (top - elmDims[1] - this._getIntOpt(index, 'top') - 10);
                }

                tooltp.style.left = left + 'px';
                tooltp.style.top = top + 'px';
            }
        },

        _getPageXY: function() {
            var cWidth = 0;
            var cHeight = 0;
            if( typeof( window.innerWidth ) === 'number' ) {
                cWidth = window.innerWidth;
                cHeight = window.innerHeight;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                cWidth = document.documentElement.clientWidth;
                cHeight = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                cWidth = document.body.clientWidth;
                cHeight = document.body.clientHeight;
            }
            return [parseInt(cWidth, 10), parseInt(cHeight, 10)];
        },

        getScroll: function() {
            var dd = document.documentElement, db = document.body;
            if (dd && (dd.scrollLeft || dd.scrollTop)) {
                return [dd.scrollLeft, dd.scrollTop];
            } else if (db) {
                return [db.scrollLeft, db.scrollTop];
            } else {
                return [0, 0];
            }
        },

        getMousePosition: function(e) {
            return [parseInt(InkEvent.pointerX(e), 10), parseInt(InkEvent.pointerY(e), 10)];
        },
    };

    return Tooltip;
});
