/**
 * @module Ink.UI.Tooltip_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.Tooltip', '1', ['Ink.UI.Aux_1', 'Ink.Dom.Event_1', 'Ink.Dom.Element_1', 'Ink.Dom.Selector_1'], function (Aux, InkEvent, InkElement, Selector) {
    'use strict';

    function Tooltip (element, options) {
        this._init(element, options || {});
    }

    function ok(v) {  // Sanity check. TODO remove
        if (!v) {throw new Error(v);}
    }

    Tooltip.prototype = {
        _init: function(element, options) {
            var elements;

            this.sto = false;

            this.options = Ink.extendObj({
                    //elementAttr: 'element',
                    where: 'mousefix',  // TODO better default
                    zIndex: 10000,
                    hasText: true,
                    leftElm: 20,
                    topElm: 20,
                    delay: 0,
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
        _makeTooltip: function (index, mouseEvent) {
            ok(this.elements[index]);
            var oldtip = this.elements[index].tooltip;
            if (oldtip && oldtip.parentNode) {
                oldtip.parentNode.removeChild(oldtip);
            }
            var element = this.elements[index].element;
            var options = this.elements[index].options;
            
            var template = this._getOpt(index, 'template');
            var tooltip;

            if (template) {
                tooltip = Aux.elOrSelector(template, 'options.template');
            } else {
                tooltip = document.createElement('DIV');
            }

            this.elements[index].tooltip = tooltip;
            tooltip.style.display = 'block';
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = this._getOpt(index, 'zIndex');
            var where = this._getOpt(index, 'where');

            switch (where) {
                case 'right':
                    var pos = Element.offset(element);
                    this.setPosition(index, (parseInt(pos[0], 10) + options.leftElm), (parseInt(pos[1], 10) + options.topElm));
                    break;

                case 'left':
                    var pos = Element.offset(element);
                    this.setPosition(index, (parseInt(pos[0], 10) + options.leftElm), (parseInt(pos[1], 10) + options.topElm));
                    break;

                case 'mousemove':
                case 'mousefix':
                    var mPos = this.getMousePosition(mouseEvent);
                    this.setPosition(index, (parseInt(mPos[0], 10) + options.leftElm), (parseInt(mPos[1], 10) + options.topElm));
                    break;

                default:
                    this.setPosition(index, (parseInt(pos[0], 10) + options.leftElm), (parseInt(pos[1], 10) + options.topElm));
                    break;
            }
            if (document.documentElement) {
                document.documentElement.appendChild(tooltip);
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
        onMouseOver: function(e, index) {
            var options = this.elements[index].options;
            var tooltp = this._makeTooltip(index, e);

            if(this.sto) {
                clearTimeout(this.sto);
            }

            this.sto = setTimeout(function() {
                this.writeContent(index);
            }.bind(this), options.delay * 1000);  // TODO Function#bind is es4

            this.active = true;
        },

        onMouseOut: function(e, index) {
            var options = this.elements[index].options;
            var tooltp = this.elements[index].tooltip;
            if(tooltp) {
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
            var options = this.elements[index].options;
            var tooltp = this.elements[index].tooltip;
            if (tooltp) {
                if (options.where === 'mousemove' && this.active) {
                    var mPos = this.getMousePosition(e);
                    this.setPosition(index, (mPos[0] + options.leftElm), (mPos[1] + options.topElm));
                }
            }
        },

        setPosition: function(index, left, top) {
            var pageDims = this.getPageXY();
            var tooltp = this.elements[index].tooltip;
            if (tooltp) {
                var elmDims = [InkElement.elementWidth(tooltp), InkElement.elementHeight(tooltp)];
                var scrollDim = this.getScroll();

                if((elmDims[0] + left - scrollDim[0]) >= (pageDims[0] - 20)) {
                    left = (left - elmDims[0] - this.elements[index].options.leftElm - 10);
                }
                if((elmDims[1] + top - scrollDim[1]) >= (pageDims[1] - 20)) {
                    top = (top - elmDims[1] - this.elements[index].options.topElm - 10);
                }

                tooltp.style.left = left+'px';
                tooltp.style.top = top+'px';
            }
        },

        getPageXY: function() {
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

        writeContent: function(index) {
            if(this.elements[index].tooltip) {
                var content = this._getOpt(index, 'text');

                this.elements[index].tooltip.innerHTML = content;
            }
        },
    };

    return Tooltip;
});
