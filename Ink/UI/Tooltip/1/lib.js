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
            this.iframe = false;
            this.createHackIframe();

            this.options = Ink.extendObj({
                    //elementAttr: 'element',
                    where: 'mousefix',  // TODO better default
                    template: false,  // TODO remove
                    zindex: 10000,
                    hasText: true,
                    leftElm: 20,
                    topElm: 20,
                    delay: 0,
                    text: '',
                    hasIframe: true,
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
            this.options.template = Aux.elOrSelector(this.options.template, 'Tooltip template');
            this.options.delay = (this.options.delay * 1000);

            this.options.template.style.visibility = 'hidden';
            this.options.template.style.display = 'block';

            elm = Aux.elOrSelector(elm);

            InkEvent.observe(elm, 'mouseover', Ink.bindEvent(this.onMouseOver, this, index));
            InkEvent.observe(elm, 'mouseout', Ink.bindEvent(this.onMouseOut, this, index));
            InkEvent.observe(elm, 'mousemove', Ink.bindEvent(this.onMouseMove, this, index));

            return {
                element: elm,
                options: this.options
            };
        },
        _getOpt: function (index, option) {
            ok(index + 1);ok(option);
            var dataAttrVal = this.elements[index].element.getAttribute('data-tip-' + option);
            if (typeof dataAttrVal !== 'undefined' && dataAttrVal !== null) {
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
            var element = this.elements[index].element;
            if(options.template) {
                options.template.style.zIndex = options.zindex;

                switch(options.where) {
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
                        var mPos = this.getMousePosition(e);
                        this.setPosition(index, (parseInt(mPos[0], 10) + options.leftElm), (parseInt(mPos[1], 10) + options.topElm));
                        break;

                    default:
                        this.setPosition(index, (parseInt(pos[0], 10) + options.leftElm), (parseInt(pos[1], 10) + options.topElm));
                        break;
                }

                if(this.sto) {
                    clearTimeout(this.sto);
                    this.sto = false;
                }

                this.sto = setTimeout(function() {

                    this.writeContent(index);

                    if(options.hasIframe) {
                        this.iframe.style.width = (parseInt(InkElement.elementWidth(options.template), 10) + 0)+'px';
                        this.iframe.style.height = (parseInt(InkElement.elementHeight(options.template), 10) + 0)+'px';
                    }

                    options.template.style.visibility = 'visible';
                    if(options.hasIframe) {
                        this.iframe.style.display = 'block';
                    }

                }.bind(this), options.delay);  // TODO Function#bind is es4

                this.active = true;
            }
        },

        onMouseOut: function(e, index) {
            var options = this.elements[index].options;
            if(options.template) {
                if(options.hasIframe) {
                    this.iframe.style.display = 'none';
                }
                options.template.style.visibility = 'hidden';
                options.template.style.position = 'absolute';

                options.template.style.left = '0px';
                options.template.style.top = '0px';

                if(this.sto) {
                    clearTimeout(this.sto);
                    this.sto = false;
                }

                this.active = false;
            }
        },

        onMouseMove: function(e, index) {
            var options = this.elements[index].options;
            if(options.template) {
                if(options.where === 'mousemove' && this.active) {
                    var mPos = this.getMousePosition(e);
                    this.setPosition(index, (mPos[0] + options.leftElm), (mPos[1] + options.topElm));
                }
            }
        },

        setPosition: function(index, left, top) {
            var pageDims = this.getPageXY();
            var elmDims = [parseInt(InkElement.elementWidth(this.elements[index].options.template), 10), parseInt(InkElement.elementHeight(this.elements[index].options.template), 10)];
            var scrollDim = this.getScroll();

            if((elmDims[0] + left - scrollDim[0]) >= (pageDims[0] - 20)) {
                left = (left - elmDims[0] - this.elements[index].options.leftElm - 10);
            }
            if((elmDims[1] + top - scrollDim[1]) >= (pageDims[1] - 20)) {
                top = (top - elmDims[1] - this.elements[index].options.topElm - 10);
            }

            if(this.elements[index].options.hasIframe) {
                this.iframe.style.left = left+'px';
                this.iframe.style.top = top+'px';
            }

            this.elements[index].options.template.style.left = left+'px';
            this.elements[index].options.template.style.top = top+'px';
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
            if(this.elements[index].options.hasText) {
                var content = this._getOpt(index, 'text');

                this.elements[index].options.template.innerHTML = content;
            }
        },

        createHackIframe: function() {
            this.iframe = document.createElement('IFRAME');
            this.iframe.style.border = '0px';
            this.iframe.style.margin = '0px';
            this.iframe.style.padding = '0px';
            this.iframe.style.position = 'absolute';
            if(this.iframe.style.opacity) {
                this.iframe.style.opacity = '1';
            }
            this.iframe.style.display = 'none';
            this.iframe.style.zIndex = 999;

            if(document.body) {
                document.body.appendChild(this.iframe);
            }
        }
    };

    return Tooltip;
});
