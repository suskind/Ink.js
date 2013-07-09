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

    Tooltip.prototype = {
        _init: function(element, options) {
            var elements;

            this.sto = false;
            this.iframe = false;
            this.createHackIframe();
            this._elmOptions = [];  // Options for each element, given as data attrs

            this.options = Ink.extendObj({
                    //elementAttr: 'element',
                    where: 'mousefix',
                    template: false,
                    zindex: 10000,
                    hasText: true,
                    contentAttr: 'title',
                    contentText: false,
                    contentElm: false,
                    leftElm: 20,
                    topElm: 20,
                    delay: 0,
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
                this._elmOptions[i] = {};
                this.elements[i] = this._initEach(elements[i], i);
            }
        },
        _initEach: function(elm, index) {
            this.options.template = Aux.elOrSelector(this.options.template, 'Tooltip template');
            this.options.delay = (this.options.delay * 1000);

            if(this.options.contentElm) {
                this.options.contentElm = Aux.elOrSelector(this.options.contentElm);
            }

            this.options.template.style.visibility = 'hidden';
            this.options.template.style.display = 'block';

            var elm = Aux.elOrSelector(elm);

            InkEvent.observe(elm, 'mouseover', Ink.bindEvent(this.onMouseOver, this, index));
            InkEvent.observe(elm, 'mouseout', Ink.bindEvent(this.onMouseOut, this, index));
            InkEvent.observe(elm, 'mousemove', Ink.bindEvent(this.onMouseMove, this, index));

            return {
                element: elm,
                options: this.options
            };
        },
        onMouseOver: function(e, index) {
            if(this.elements[index].options.template) {

                this.elements[index].options.template.style.zIndex = this.elements[index].options.zindex;

                switch(this.elements[index].options.where) {
                    case 'right':
                        var pos = Position.cumulativeOffset(this.elements[index].element);
                        this.setPosition(index, (parseInt(pos[0]) + this.elements[index].options.leftElm), (parseInt(pos[1]) + this.elements[index].options.topElm));
                        break;

                    case 'left':
                        var pos = Position.cumulativeOffset(this.elements[index].element);
                        this.setPosition(index, (parseInt(pos[0]) + this.elements[index].options.leftElm), (parseInt(pos[1]) + this.elements[index].options.topElm));
                        break;

                    case 'mousemove':
                    case 'mousefix':
                        var mPos = this.getMousePosition(e);
                        this.setPosition(index, (parseInt(mPos[0]) + this.elements[index].options.leftElm), (parseInt(mPos[1]) + this.elements[index].options.topElm));
                        break;

                    default:
                        this.setPosition(index, (parseInt(pos[0]) + this.elements[index].options.leftElm), (parseInt(pos[1]) + this.elements[index].options.topElm));
                        break;
                }

                if(this.sto) {
                    clearTimeout(this.sto);
                    this.sto = false;
                }

                this.sto = setTimeout(function() {

                    this.writeContent(index);

                    if(this.elements[index].options.hasIframe) {
                        this.iframe.style.width = (parseInt(InkElement.elementWidth(this.elements[index].options.template)) + 0)+'px';
                        this.iframe.style.height = (parseInt(InkElement.elementHeight(this.elements[index].options.template)) + 0)+'px';
                    }

                    this.elements[index].options.template.style.visibility = 'visible';
                    if(this.elements[index].options.hasIframe) {
                        this.iframe.style.display = 'block';
                    }

                }.bind(this), this.elements[index].options.delay);

                this.active = true;
            }
        },

        onMouseOut: function(e, index) {
            if(this.elements[index].options.template) {
                if(this.elements[index].options.hasIframe) {
                    this.iframe.style.display = 'none';
                }
                this.elements[index].options.template.style.visibility = 'hidden';

                this.elements[index].options.template.style.left = '0px';
                this.elements[index].options.template.style.top = '0px';

                if(this.sto) {
                    clearTimeout(this.sto);
                    this.sto = false;
                }

                this.active = false;
            }
        },

        onMouseMove: function(e, index) {
            if(this.elements[index].options.template) {
                if(this.elements[index].options.where == 'mousemove' && this.active) {
                    var mPos = this.getMousePosition(e);
                    this.setPosition(index, (mPos[0] + this.elements[index].options.leftElm), (mPos[1] + this.elements[index].options.topElm));
                }
            }
        },

        setPosition: function(index, left, top) {
            var pageDims = this.getPageXY();
            var elmDims = [parseInt(InkElement.elementWidth(this.elements[index].options.template)), parseInt(InkElement.elementHeight(this.elements[index].options.template))];
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
            if( typeof( window.innerWidth ) == 'number' ) {
                cWidth = window.innerWidth;
                cHeight = window.innerHeight;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                cWidth = document.documentElement.clientWidth;
                cHeight = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                cWidth = document.body.clientWidth;
                cHeight = document.body.clientHeight;
            }
            return [parseInt(cWidth), parseInt(cHeight)];
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
            return [parseInt(InkEvent.pointerX(e)), parseInt(InkEvent.pointerY(e))]
        },

        writeContent: function(index) {
            if(this.elements[index].options.hasText) {
                if(this.elements[index].options.contentText) {
                    var content = this.elements[index].options.contentText;
                } else {
                    var content = this.elements[index].element.getAttribute(this.elements[index].options.contentAttr);
                }

                if(this.elements[index].options.contentElm) {
                    this.elements[index].options.contentElm.innerHTML = content;
                } else {
                    this.elements[index].options.template.innerHTML = content;
                }
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
