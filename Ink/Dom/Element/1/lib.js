/**
 * @author: inkdev AT sapo.pt
 */

Ink.createModule('Ink.Dom.Element', 1, [], function() {

/**
 */
var Element = {

    /**
     * @function {DOMElement|Array} ? Shortcut for document.getElementById
     *
     * @param {string|Array} elm - Receives either an id or an Array of id's
     *
     * @return Either the DOM element for the given id or an array of elements for the given ids
     */
    get: function(elm) {
        if(typeof elm !== 'undefined') {
            if(typeof elm === 'string') {
                return document.getElementById(elm);
            }
            return elm;
        }
        return null;
    },

    /**
     * @function {DOMElement} ? Creates a DOM element
     * @param {String} tag - tag name
     * @param {Object} properties - object with properties to be set on the element
     */
    create: function(tag, properties) {
        var el = document.createElement(tag);
        //Ink.extendObj(el, properties);
        for(var property in properties) {
            if(properties.hasOwnProperty(property)) {
                if(property === 'className') {
                    property = 'class';
                }
                el.setAttribute(property, properties[property]);
            }
        }
        return el;
    },

    /**
     * @function ? removes DOM Element from DOM
     * @param  {DOMElement} el
     */
    remove: function(el) {
        var parEl;
        if (el && (parEl = el.parentNode)) {
            parEl.removeChild(el);
        }
    },

    /**
     * @function ? Scrolls to an element
     * @param {DOMElement|String} elm - Element where to scroll
     */
    scrollTo: function(elm) {
        elm = this.get(elm);
        if(elm) {
            if (elm.scrollIntoView) {
                return elm.scrollIntoView();
            }

            var elmOffset = {},
                elmTop = 0, elmLeft = 0;

            do {
                elmTop += elm.offsetTop || 0;
                elmLeft += elm.offsetLeft || 0;

                elm = elm.offsetParent;
            } while(elm);

            elmOffset = {x: elmLeft, y: elmTop};

            window.scrollTo(elmOffset.x, elmOffset.y);
        }
    },

    /**
     * @function {Number} ? Gets the top cumulative offset for an element
     * @param {DOMElement|String} elm - target element
     * @return Offset from the target element to the top of the document
     */
    offsetTop: function(elm) {
        elm = this.get(elm);

        var offset = elm.offsetTop;

        while(elm.offsetParent){
            if(elm.offsetParent.tagName.toLowerCase() !== "body"){
                elm = elm.offsetParent;
                offset += elm.offsetTop;
            } else {
                break;
            }
        }

        return offset;
    },

    /**
     * @function {Number} ? Gets the left cumulative offset for an element
     * @param {DOMElement|String} elm - target element
     * @return Offset from the target element to the left of the document
     */
    offsetLeft: function(elm) {
        elm = this.get(elm);

        var offset = elm.offsetLeft;

        while(elm.offsetParent){
            if(elm.offsetParent.tagName.toLowerCase() !== "body"){
                elm = elm.offsetParent;
                offset += elm.offsetLeft;
            } else {
                break;
            }
        }

        return offset;
    },

    /**
    * @function {Array} ? gets the element offset relative to its closest positioned ancestor
    * @param {DOMElement|String} elm - target element
    * @return Array with the element offsetleft and offsettop relative to the closest positioned ancestor
    */
    positionedOffset: function(element) {
        var valueTop = 0, valueLeft = 0;
        element = this.get(element);
        do {
            valueTop  += element.offsetTop  || 0;
            valueLeft += element.offsetLeft || 0;
            element = element.offsetParent;
            if (element) {
                if (element.tagName.toLowerCase() === 'body') { break;  }

                var value = element.style.position;
                if (!value && element.currentStyle) {
                    value = element.currentStyle.position;
                }
                if ((!value || value === 'auto') && typeof getComputedStyle !== 'undefined') {
                    var css = getComputedStyle(element, null);
                    value = css ? css.position : null;
                }
                if (value === 'relative' || value === 'absolute') { break;  }
            }
        } while (element);
        return [valueLeft, valueTop];
    },

    /**
     * @function {Array} ? Gets the cumulative offset for an element
     * @param {DOMElement|String} elm - target element
     * @return Array with offset from the target element to the top/left of the document
     */
    offset: function(elm) {
        return [
            this.offsetLeft(elm),
            this.offsetTop(elm)
        ];
    },

    /**
     * @function {Array} ? Gets the scroll of the element
     * @param {optional DOMElement|String} elm - target element or document.body
     */
    scroll: function(elm) {
        elm = elm ? Ink.i(elm) : document.body;
        return [
            ( ( !window.pageXOffset ) ? elm.scrollLeft : window.pageXOffset ),
            ( ( !window.pageYOffset ) ? elm.scrollTop : window.pageYOffset )
        ];
    },

    _getPropPx: function(cs, prop) {
        var n, c;
        var val = cs.getPropertyValue ? cs.getPropertyValue(prop) : cs[prop];
        if (!val) { n = 0; }
        else {
            c = val.indexOf('px');
            if (c === -1) { n = 0; }
            else {
                n = parseInt(val, 10);
            }
        }

        //console.log([prop, ' "', val, '" ', n].join(''));

        return n;
    },

    /**
     * @function {Number[2]} ? returns the top left position of the element on the page
     * @param {String|DOMElement} el
     */
    offset2: function(el) {
        /*jshint boss:true */
        el = Ink.i(el);
        var bProp = ['border-left-width', 'border-top-width'];
        var res = [0, 0];
        var dRes, bRes, parent, cs;
        var getPropPx = this._getPropPx;

        do {
            cs = window.getComputedStyle ? window.getComputedStyle(el, null) : el.currentStyle;
            dRes = [el.offsetLeft | 0, el.offsetTop | 0];
            bRes = [getPropPx(cs, bProp[0]), getPropPx(cs, bProp[1])];
            //console.log([el, dRes.join(','), bRes.join(',')]);
            if (Ink.Browser.OPERA) {   // apparently Opera does need border width correction
                res[0] += dRes[0];
                res[1] += dRes[1];
            }
            else {
                res[0] += dRes[0] + bRes[0];
                res[1] += dRes[1] + bRes[1];
            }
            parent = el.offsetParent;
            //console.log(parent);
        } while (el = parent);

        bRes = [getPropPx(cs, bProp[0]), getPropPx(cs, bProp[1])];

        if (Ink.Browser.OPERA) {
        }
        else if (Ink.Browser.GECKO) {
            res[0] += bRes[0];
            res[1] += bRes[1];
        }
        else {
            res[0] -= bRes[0];
            res[1] -= bRes[1];
        }
        return res;
    },

    /**
     * @function {Boolean} ? Verifies the existence of an attribute
     * @param {Object} elm - target element
     * @param {String} attr - attribute name
     * @return Boolean based on existance of attribute
     */
    hasAttribute: function(elm, attr){
        return elm.hasAttribute ? elm.hasAttribute(attr) : !!elm.getAttribute(attr);
    },
    /**
     * @function ? Inserts a element immediately after a target element
     * @param {DOMElement} newElm - element to be inserted
     * @param {DOMElement|String} targetElm - key element
     */
    insertAfter: function(newElm,targetElm) {
        /*jshint boss:true */
        if (targetElm = this.get(targetElm)) {
            targetElm.parentNode.insertBefore(newElm, targetElm.nextSibling);
        }
    },

    /**
     * @function ? Inserts a element at the top of the childNodes of a target element
     * @param {DOMElement} newElm - element to be inserted
     * @param {DOMElement|String} targetElm - key element
     */
    insertTop: function(newElm,targetElm) {
        /*jshint boss:true */
        if (targetElm = this.get(targetElm)) {
            targetElm.insertBefore(newElm, targetElm.firstChild);
        }
    },

    /**
     * @function ? Retreives textContent from node
     * @param {DOMNode} node from which to retreive text from.
     *                  Can be any node type.
     * @return {String} the text
     */
    textContent: function(node){
        node = Ink.i(node);
        var text, k, cs, m;

        switch(node && node.nodeType) {
        case 9: /*DOCUMENT_NODE*/
            // IE quirks mode does not have documentElement
            return this.textContent(node.documentElement || node.body && node.body.parentNode || node.body);

        case 1: /*ELEMENT_NODE*/
            text = node.innerText;
            if (typeof text !== 'undefined') {
                return text;
            }
            /* falls through */
        case 11: /*DOCUMENT_FRAGMENT_NODE*/
            text = node.textContent;
            if (typeof text !== 'undefined') {
                return text;
            }

            if (node.firstChild === node.lastChild) {
                // Common case: 0 or 1 children
                return this.textContent(node.firstChild);
            }

            text = [];
            cs = node.childNodes;
            for (k = 0, m = cs.length; k < m; ++k) {
                text.push( this.textContent( cs[k] ) );
            }
            return text.join('');

        case 3: /*TEXT_NODE*/
        case 4: /*CDATA_SECTION_NODE*/
            return node.nodeValue;
        }
        return '';
    },

    /**
     * @function ? Removes all nodes children and adds the text
     * @param {DOMNode} node from which to retreive text from.
     *                  Can be any node type.
     * @return {String} the text
     */
    setTextContent: function(node, text){
        node = Ink.i(node);
        switch(node && node.nodeType)
        {
        case 1: /*ELEMENT_NODE*/
            if ('innerText' in node) {
                node.innerText = text;
                break;
            }
            /* falls through */
        case 11: /*DOCUMENT_FRAGMENT_NODE*/
            if ('textContent' in node) {
                node.textContent = text;
                break;
            }
            /* falls through */
        case 9: /*DOCUMENT_NODE*/
            while(node.firstChild) {
                node.removeChild(node.firstChild);
            }
            if (text !== '') {
                var doc = node.ownerDocument || node;
                node.appendChild(doc.createTextNode(text));
            }
            break;

        case 3: /*TEXT_NODE*/
        case 4: /*CDATA_SECTION_NODE*/
            node.nodeValue = text;
            break;
        }
    },

    /**
     * @function ? Tells if element is a clickable link
     * @param {DOMNode} node to check if it's link
     * @return {Boolean}
     */
    isLink: function(element){
        var b = element && element.nodeType === 1 && ((/^a|area$/i).test(element.tagName) ||
            element.hasAttributeNS && element.hasAttributeNS('http://www.w3.org/1999/xlink','href'));
        return !!b;
    },

    /**
     * @function ? Tells if ancestor is ancestor of node
     * @param {DOMNode} ancestor node
     * @param {DOMNode} descendant node
     * @return {Boolean}
     */
    isAncestorOf: function(ancestor, node){
        /*jshint boss:true */
        if (!node || !ancestor) {
            return false;
        }
        if (node.compareDocumentPosition) {
            return (ancestor.compareDocumentPosition(node) & 0x10) !== 0;/*Node.DOCUMENT_POSITION_CONTAINED_BY*/
        }
        while (node = node.parentNode){
            if (node === ancestor){
                return true;
            }
        }
        return false;
    },

    /**
     * @function ? Tells if descendant is descendant of node
     * @param {DOMNode} node the ancestor
     * @param {DOMNode} descendant the descendant
     * @return {Boolean} true if 'descendant' is descendant of 'node'
     */
    descendantOf: function(node, descendant){
        return node !== descendant && this.isAncestorOf(node, descendant);
    },

    /**
     * @function ? Get first child in document order of node type 1
     * @param {DOMNode} parent node
     * @return {DOMNode} the element child
     */
    firstElementChild: function(elm){
        if(!elm) {
            return null;
        }
        if ('firstElementChild' in elm) {
            return elm.firstElementChild;
        }
        var child = elm.firstChild;
        while(child && child.nodeType !== 1) {
            child = child.nextSibling;
        }
        return child;
    },

    /**
     * @function ? Get last child in document order of node type 1
     * @param {DOMNode} parent node
     * @return {DOMNode} the element child
     */
    lastElementChild: function(elm){
        if(!elm) {
            return null;
        }
        if ('lastElementChild' in elm) {
            return elm.lastElementChild;
        }
        var child = elm.lastChild;
        while(child && child.nodeType !== 1) {
            child = child.previousSibling;
        }
        return child;
    },


    /**
     * @function ? Get the first element sibling after the node
     * @param {DOMNode}         current node
     * @return {DOMNode|Null}   the first element sibling after node or null if none is found
     */
    nextElementSibling: function(node){
        var sibling = null;

        if(!node){ return sibling; }

        if("nextElementSibling" in node){
            return node.nextElementSibling;
        } else {
            sibling = node.nextSibling;

            // 1 === Node.ELEMENT_NODE
            while(sibling && sibling.nodeType !== 1){
                sibling = sibling.nextSibling;
            }

            return sibling;
        }
    },

    /**
     * @function ? Get the first element sibling before the node
     * @param {DOMNode}         current node
     * @return {DOMNode|Null}   the first element sibling before node or null if none is found
     */
    previousElementSibling: function(node){
        var sibling = null;

        if(!node){ return sibling; }

        if("previousElementSibling" in node){
            return node.previousElementSibling;
        } else {
            sibling = node.previousSibling;

            // 1 === Node.ELEMENT_NODE
            while(sibling && sibling.nodeType !== 1){
                sibling = sibling.previousSibling;
            }

            return sibling;
        }
    },

    /**
     * @function ?
     * @param {DOMElement|string} element target DOM element or target ID
     * @return {Number} element width
     */
    elementWidth: function(element) {
        if(typeof element === "string") {
            element = document.getElementById(element);
        }
        return element.offsetWidth;
    },

    /**
     * @function ?
     * @param {DOMElement|string} element target DOM element or target ID
     * @return {Number} element height
     */
    elementHeight: function(element) {
        if(typeof element === "string") {
            element = document.getElementById(element);
        }
        return element.offsetHeight;
    },

    /**
     * @function ?
     * @param {DOMElement|string} element target DOM element or target ID
     * @return {Number} element left position
     */
    elementLeft: function(element) {
        if(typeof element === "string") {
            element = document.getElementById(element);
        }
        return element.offsetLeft;
    },

    /**
     * @function ?
     * @param {DOMElement|string} element target DOM element or target ID
     * @return {Number} element top position
     */
    elementTop: function(element) {
        if(typeof element === "string") {
            element = document.getElementById(element);
        }
        return element.offsetTop;
    },

    /**
     * @function ? {Number}
     * @param {element} element target element
     * @return {Array} array with element's width and height
     */
    elementDimensions: function(element) {
        if(typeof element === "string") {
            element = document.getElementById(element);
        }
        return Array(element.offsetWidth, element.offsetHeight);
    },

    /**
     * @function ?
     * @param {DOMElement} element to be position cloned
     * @param {DOMElement} element to get the cloned position
     * @return {DOMElement} the element with positionClone
     */
    clonePosition: function(cloneTo, cloneFrom){
        cloneTo.style.top = this.offsetTop(cloneFrom) + 'px';
        cloneTo.style.left = this.offsetLeft(cloneFrom) + 'px';

        return cloneTo;
    },

    /**
     * Slices off a piece of text at the end of the element and adds the ellipsis
     * so all text fits in the element.
     * @param element   which text is to add the ellipsis
     * @param ellipsis  Optional. String to append to the chopped text.
     */
    ellipsizeText: function(element, ellipsis){
        /*jshint boss:true */
        if (element = Ink.i(element)){
            while (element && element.scrollHeight > (element.offsetHeight + 8)) {
                element.textContent = element.textContent.replace(/(\s+\S+)\s*$/, ellipsis || '\u2026');
            }
        }
    },

    /**
     * @function {HtmlElement|false} ? searches up the DOM tree for an element of specified class name
     * @param {HtmlElement} element
     * @param {String}      className
     */
    findUpwardsByClass: function(element, className) {
        var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
        while (true) {
            if (typeof(element.className) !== 'undefined' && re.test(element.className)) {
                return element;
            }
            else {
                element = element.parentNode;
                if (!element || element.nodeType !== 1) {
                    return false;
                }
            }
        }
    },


    /**
     * @function {HtmlElement|false} ? searches up the DOM tree for an element of specified class name
     * @param {HtmlElement} element
     * @param {String}      className
     */
    findUpwardsByTag: function(element, tag) {
        while (true) {
            if (element && element.nodeName.toUpperCase() === tag.toUpperCase()) {
                return element;
            } else {
                element = element.parentNode;
                if (!element || element.nodeType !== 1) {
                    return false;
                }
            }
        }
    },


    /**
     * @function {HtmlElement|false} ? searches up the DOM tree for an element of specified id
     * @param {HtmlElement} element
     * @param {String}      id
     */
    findUpwardsById: function(element, id) {
        while (true) {
            if (typeof(element.id) !== 'undefined' && element.id === id) {
                return element;
            } else {
                element = element.parentNode;
                if (!element || element.nodeType !== 1) {
                    return false;
                }
            }
        }
    },


    /**
     * @function {String} ? returns trimmed text content of descendants
     * @param {DOMElement}          el          - element being seeked
     * @param {optional Boolean}    removeIt    - whether to remove the found text nodes or not
     * @return text found
     */
    getChildrenText: function(el, removeIt) {
        var node,
            j,
            part,
            nodes = el.childNodes,
            jLen = nodes.length,
            text = '';

        if (!el) {
            return text;
        }

        for (j = 0; j < jLen; ++j) {
            node = nodes[j];
            if (!node) {    continue;   }
            if (node.nodeType === 3) {  // TEXT NODE
                part = this._trimString( String(node.data) );
                if (part.length > 0) {
                    text += part;
                    if (removeIt) { el.removeChild(node);   }
                }
                else {  el.removeChild(node);   }
            }
        }

        return text;
    },

    /**
     * Used by getChildrenText
     * @function {private String} ? string trim implementation
     * @param {String} text
     */
    _trimString: function(text) {
        return (String.prototype.trim) ? text.trim() : text.replace(/^\s*/, '').replace(/\s*$/, '');
    },


    /**
     * @function {Array} ? possible values
     * @param {DomElement|String} select element
     */
    getSelectValues: function (select) {
        var selectEl = Ink.i(select);
        var values = [];
        for (var i = 0; i < selectEl.options.length; ++i) {
            values.push( selectEl.options[i].value );
        }
        return values;
    },


    /* used by fills */
    _normalizeData: function(data) {
        var d, data2 = [];
        for (var i = 0, f = data.length; i < f; ++i) {
            d = data[i];

            if (!(d instanceof Array)) {    // if not array, wraps primitive twice:     val -> [val, val]
                d = [d, d];
            }
            else if (d.length === 1) {      // if 1 element array:                      [val] -> [val, val]
                d.push(d[0]);
            }
            data2.push(d);
        }
        return data2;
    },


    /**
     * @function ? fills select element with choices
     * @param {DomElement|String}           container       select element which will get filled
     * @param {Number[]|String[]|Array[]}   data            data which will populate the component
     * @param {optional Boolean}            skipEmpty       true to skip empty option
     * @param {optional String|Number}      defaultValue    primitive value to select at beginning
     */
    fillSelect: function(container, data, skipEmpty, defaultValue) {
        var containerEl = Ink.i(container);
        if (!containerEl) {   return; }

        containerEl.innerHTML = '';
        var d, optionEl;

        if (!skipEmpty) {
            // add initial empty option
            optionEl = document.createElement('option');
            optionEl.setAttribute('value', '');
            containerEl.appendChild(optionEl);
        }

        data = this._normalizeData(data);

        for (var i = 0, f = data.length; i < f; ++i) {
            d = data[i];

            optionEl = document.createElement('option');
            optionEl.setAttribute('value', d[0]);
            if (d.length > 2) {
                optionEl.setAttribute('extra', d[2]);
            }
            optionEl.appendChild( document.createTextNode(d[1]) );

            if (d[0] === defaultValue) {
                optionEl.setAttribute('selected', 'selected');
            }

            containerEl.appendChild(optionEl);
        }
    },


    /**
     * @function ? select element on steroids - allows the creation of new values
     * @param {DomElement|String} ctn select element which will get filled
     * @param {Object} opts
     * @... {Number[]|String[]|Array[]}             data                data which will populate the component
     * @... {optional Boolean}                      skipEmpty           if true empty option is not created (defaults to false)
     * @... {optional String}                       emptyLabel          label to display on empty option
     * @... {optional String}                       createLabel         label to display on create option
     * @... {optional String}                       optionsGroupLabel   text to display on group surrounding value options
     * @... {optional String}                       defaultValue        option to select initially
     * @... {optional Function(selEl, addOptFn)}    onCreate            callback that gets called once user selects the create option
     */
    fillSelect2: function(ctn, opts) {
        ctn = Ink.i(ctn);
        ctn.innerHTML = '';

        var defs = {
            skipEmpty:              false,
            skipCreate:             false,
            emptyLabel:             'none',
            createLabel:            'create',
            optionsGroupLabel:      'groups',
            emptyOptionsGroupLabel: 'none exist',
            defaultValue:           ''
        };
        if (!opts) {      throw 'param opts is a requirement!';   }
        if (!opts.data) { throw 'opts.data is a requirement!';    }
        opts = Ink.extendObj(defs, opts);

        var optionEl, d;

        var optGroupValuesEl = document.createElement('optgroup');
        optGroupValuesEl.setAttribute('label', opts.optionsGroupLabel);

        opts.data = this._normalizeData(opts.data);

        if (!opts.skipCreate) {
            opts.data.unshift(['$create$', opts.createLabel]);
        }

        if (!opts.skipEmpty) {
            opts.data.unshift(['', opts.emptyLabel]);
        }

        for (var i = 0, f = opts.data.length; i < f; ++i) {
            d = opts.data[i];

            optionEl = document.createElement('option');
            optionEl.setAttribute('value', d[0]);
            optionEl.appendChild( document.createTextNode(d[1]) );

            if (d[0] === opts.defaultValue) {   optionEl.setAttribute('selected', 'selected');  }

            if (d[0] === '' || d[0] === '$create$') {
                ctn.appendChild(optionEl);
            }
            else {
                optGroupValuesEl.appendChild(optionEl);
            }
        }

        var lastValIsNotOption = function(data) {
            var lastVal = data[data.length-1][0];
            return (lastVal === '' || lastVal === '$create$');
        };

        if (lastValIsNotOption(opts.data)) {
            optionEl = document.createElement('option');
            optionEl.setAttribute('value', '$dummy$');
            optionEl.setAttribute('disabled', 'disabled');
            optionEl.appendChild(   document.createTextNode(opts.emptyOptionsGroupLabel)    );
            optGroupValuesEl.appendChild(optionEl);
        }

        ctn.appendChild(optGroupValuesEl);

        var addOption = function(v, l) {
            var optionEl = ctn.options[ctn.options.length - 1];
            if (optionEl.getAttribute('disabled')) {
                optionEl.parentNode.removeChild(optionEl);
            }

            // create it
            optionEl = document.createElement('option');
            optionEl.setAttribute('value', v);
            optionEl.appendChild(   document.createTextNode(l)  );
            optGroupValuesEl.appendChild(optionEl);

            // select it
            ctn.options[ctn.options.length - 1].setAttribute('selected', true);
        };

        if (!opts.skipCreate) {
            ctn.onchange = function() {
                if ((ctn.value === '$create$') && (typeof opts.onCreate === 'function')) {  opts.onCreate(ctn, addOption);  }
            };
        }
    },


    /**
     * @function {DomElement} ? creates set of radio buttons, returns wrapper
     * @param {DomElement|String}           insertAfterEl   element which will precede the input elements
     * @param {String}                      name            name to give to the form field ([] is added if not as suffix already)
     * @param {Number[]|String[]|Array[]}   data            data which will populate the component
     * @param {optional Boolean}            skipEmpty       true to skip empty option
     * @param {optional String|Number}      defaultValue    primitive value to select at beginning
     * @param {optional String}             splitEl         name of element to add after each input element (example: 'br')
     */
    fillRadios: function(insertAfterEl, name, data, skipEmpty, defaultValue, splitEl) {
        var afterEl = Ink.i(insertAfterEl);
        afterEl = afterEl.nextSibling;
        while (afterEl && afterEl.nodeType !== 1) {
            afterEl = afterEl.nextSibling;
        }
        var containerEl = document.createElement('span');
        if (afterEl) {
            afterEl.parentNode.insertBefore(containerEl, afterEl);
        } else {
            Ink.i(insertAfterEl).appendChild(containerEl);
        }

        data = this._normalizeData(data);

        if (name.substring(name.length - 1) !== ']') {
            name += '[]';
        }

        var d, inputEl;

        if (!skipEmpty) {
            // add initial empty option
            inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'radio');
            inputEl.setAttribute('name', name);
            inputEl.setAttribute('value', '');
            containerEl.appendChild(inputEl);
            if (splitEl) {  containerEl.appendChild( document.createElement(splitEl) ); }
        }

        for (var i = 0; i < data.length; ++i) {
            d = data[i];

            inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'radio');
            inputEl.setAttribute('name', name);
            inputEl.setAttribute('value', d[0]);
            containerEl.appendChild(inputEl);
            containerEl.appendChild( document.createTextNode(d[1]) );
            if (splitEl) {  containerEl.appendChild( document.createElement(splitEl) ); }

            if (d[0] === defaultValue) {
                inputEl.checked = true;
            }
        }

        return containerEl;
    },


    /**
     * @function {DomElement} ? creates set of checkbox buttons, returns wrapper
     * @param {DomElement|String}           insertAfterEl   element which will precede the input elements
     * @param {String}                      name            name to give to the form field ([] is added if not as suffix already)
     * @param {Number[]|String[]|Array[]}   data            data which will populate the component
     * @param {optional Boolean}            skipEmpty       true to skip empty option
     * @param {optional String|Number}      defaultValue    primitive value to select at beginning
     * @param {optional String}             splitEl         name of element to add after each input element (example: 'br')
     */
    fillChecks: function(insertAfterEl, name, data, defaultValue, splitEl) {
        var afterEl = Ink.i(insertAfterEl);
        afterEl = afterEl.nextSibling;
        while (afterEl && afterEl.nodeType !== 1) {
            afterEl = afterEl.nextSibling;
        }
        var containerEl = document.createElement('span');
        if (afterEl) {
            afterEl.parentNode.insertBefore(containerEl, afterEl);
        } else {
            Ink.i(insertAfterEl).appendChild(containerEl);
        }

        data = this._normalizeData(data);

        if (name.substring(name.length - 1) !== ']') {
            name += '[]';
        }

        var d, inputEl;

        for (var i = 0; i < data.length; ++i) {
            d = data[i];

            inputEl = document.createElement('input');
            inputEl.setAttribute('type', 'checkbox');
            inputEl.setAttribute('name', name);
            inputEl.setAttribute('value', d[0]);
            containerEl.appendChild(inputEl);
            containerEl.appendChild( document.createTextNode(d[1]) );
            if (splitEl) {  containerEl.appendChild( document.createElement(splitEl) ); }

            if (d[0] === defaultValue) {
                inputEl.checked = true;
            }
        }

        return containerEl;
    },


    /**
     * @function ? returns index of element from parent, -1 if not child of parent...
     * @param {DOMElement}  parentEl    Element to parse
     * @param {DOMElement}  childEl     Child Element to look for
     */
    parentIndexOf: function(parentEl, childEl) {
        var node, idx = 0;
        for (var i = 0, f = parentEl.childNodes.length; i < f; ++i) {
            node = parentEl.childNodes[i];
            if (node.nodeType === 1) {  // ELEMENT
                if (node === childEl) { return idx; }
                ++idx;
            }
        }
        return -1;
    },


    /*
     * @function {public} ? returns an array of elements, of the next siblings
     * @param {String|DomElement} elm element
     * @return {Array} Array of elements
    */
    nextSiblings: function(elm) {
        if(typeof(elm) === "string") {
            elm = document.getElementById(elm);
        }
        if(typeof(elm) === 'object' && elm !== null && elm.nodeType && elm.nodeType === 1) {
            var elements    = [],
                siblings    = elm.parentNode.children,
                index       = this.parentIndexOf(elm.parentNode, elm);

            for(var i = ++index, len = siblings.length; i<len; i++) {
                elements.push(siblings[i]);
            }

            return elements;
        }
        return [];
    },


    /*
     * @function {public} ? returns an array of elements, of the previous siblings
     * @param {String|DomElement} elm element
     * @return {Array} Array of elements
    */
    previousSiblings: function(elm) {
        if(typeof(elm) === "string") {
            elm = document.getElementById(elm);
        }
        if(typeof(elm) === 'object' && elm !== null && elm.nodeType && elm.nodeType === 1) {
            var elements    = [],
                siblings    = elm.parentNode.children,
                index       = this.parentIndexOf(elm.parentNode, elm);

            for(var i = 0, len = index; i<len; i++) {
                elements.push(siblings[i]);
            }

            return elements;
        }
        return [];
    },


    /*
     * @function {public} ? returns an array of elements, of the siblings
     * @param {String|DomElement} elm element
     * @return {Array} Array of elements
    */
    siblings: function(elm) {
        if(typeof(elm) === "string") {
            elm = document.getElementById(elm);
        }
        if(typeof(elm) === 'object' && elm !== null && elm.nodeType && elm.nodeType === 1) {
            var elements   = [],
                siblings   = elm.parentNode.children;

            for(var i = 0, len = siblings.length; i<len; i++) {
                if(elm !== siblings[i]) {
                    elements.push(siblings[i]);
                }
            }

            return elements;
        }
        return [];
    },

    /**
     * @function ? fallback to elem.childElementCount
     * @param {String|DomElement} elm element
     */
    childElementCount: function(elm) {
        elm = Ink.i(elm);
        if ('childElementCount' in elm) {
            return elm.childElementCount;
        }
        if (!elm) { return 0; }
        return this.siblings(elm).length + 1;
    },

    /*
     * @function {public} ? parses and appends an html string to a container, not destroying it's content
     * @param {String|DomElement} elm element
     * @param {String} html html string
     * @return {Array} Array of elements
    */
    appendHTML: function(elm, html){
        var temp = document.createElement('div');
        temp.innerHTML = html;
        var tempChildren = temp.children;
        for (var i = 0; i < tempChildren.length; i++){
            elm.appendChild(tempChildren[i]);
        }
    },

    /*
     * @function {public} ? parses and prepends an html string to a container, not destroying it's content
     * @param {String|DomElement} elm element
     * @param {String} html html string
     * @return {Array} Array of elements
    */
    prependHTML: function(elm, html){
        var temp = document.createElement('div');
        temp.innerHTML = html;
        var first = elm.firstChild;
        var tempChildren = temp.children;
        for (var i = tempChildren.length - 1; i >= 0; i--){
            elm.insertBefore(tempChildren[i], first);
            first = elm.firstChild;
        }
    },

    /*
     * @function {public} ? pass an html string and receive a documentFragment with the corresponding elements
     * @param  {String} html            html string
     * @return {DocumentFragment}       DocumentFragment containing all of the elements from the html string
     */
    htmlToFragment: function(html){
        /*jshint boss:true */
        /*global Range:false */
        if(typeof document.createRange === 'function' && typeof Range.prototype.createContextualFragment === 'function'){
            this.htmlToFragment = function(html){
                var range;

                if(typeof html !== 'string'){ return document.createDocumentFragment(); }

                range = document.createRange();

                // set the context to document.body (firefox does this already, webkit doesn't)
                range.selectNode(document.body);

                return range.createContextualFragment(html);
            };
        } else {
            this.htmlToFragment = function(html){
                var fragment = document.createDocumentFragment(),
                    tempElement,
                    current;

                if(typeof html !== 'string'){ return fragment; }

                tempElement = document.createElement('div');
                tempElement.innerHTML = html;

                // append child removes elements from the original parent
                while(current = tempElement.firstChild){ // intentional assignment
                    fragment.appendChild(current);
                }

                return fragment;
            };
        }

        return this.htmlToFragment.call(this, html);
    },

    /*
     * @function {public} ? gets all of the data attributes from an element
     * @param {String|DomElement} selector Element or CSS selector
     * @return {Object} Object with the data-* properties or empty if none found.
    */
    data: function( selector ){
        if( typeof selector !== 'object' && typeof selector !== 'string'){
            throw '[Ink.Dom.Element.data] :: Invalid selector defined';
        }

        if( typeof selector === 'object' ){
            this._element = selector;
        } else {
            var InkDomSelector = Ink.getModule('Ink.Dom.Selector', 1);
            if(!InkDomSelector) {
                throw "[Ink.Dom.Element.data] :: This method requires Ink.Dom.Selector - v1";
            }
            this._element = InkDomSelector.select( selector );
            if( this._element.length <= 0) {
                throw "[Ink.Dom.Element.data] :: Can't find any element with the specified selector";
            }
            this._element = this._element[0];
        }

        var dataset = {};
        var
            attributesElements = this._element.dataset || this._element.attributes || {},
            prop
        ;

        var propName,i;
        for( prop in attributesElements ){
            if( typeof attributesElements[prop] === 'undefined' ){
                continue;
            } else if( typeof attributesElements[prop] === 'object' ){
                prop = attributesElements[prop].name || prop;
                if(
                    ( ( attributesElements[prop].name || attributesElements[prop].nodeValue ) && ( prop.indexOf('data-') !== 0 ) ) ||
                    !( attributesElements[prop].nodeValue || attributesElements[prop].value || attributesElements[prop] )
                ){
                    continue;
                }
            }

            propName = prop.replace('data-','');
            if( propName.indexOf('-') !== -1 ){
                propName = propName.split("-");
                for( i=1; i<propName.length; i+=1 ){
                    propName[i] = propName[i].substr(0,1).toUpperCase() + propName[i].substr(1);
                }
                propName = propName.join('');
            }
            dataset[propName] = attributesElements[prop].nodeValue || attributesElements[prop].value || attributesElements[prop];
            if( dataset[propName] === "true" || dataset[propName] === "false" ){
                dataset[propName] = ( dataset[propName] === 'true' );
            }
        }

        return dataset;
    },

    /**
     * @function ?
     * @param  {Input|Textarea}  el
     * @param  {Number}          t
     */
    moveCursorTo: function(el, t) {
        if (el.setSelectionRange) {
            el.setSelectionRange(t, t);
            //el.focus();
        }
        else {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd(  'character', t);
            range.moveStart('character', t);
            range.select();
        }
    },

    /**
     * @function ?
     * @return {int} page width
     */
    pageWidth: function() {
        var xScroll;

        if (window.innerWidth && window.scrollMaxX) {
            xScroll = window.innerWidth + window.scrollMaxX;
        } else if (document.body.scrollWidth > document.body.offsetWidth){
            xScroll = document.body.scrollWidth;
        } else {
            xScroll = document.body.offsetWidth;
        }

        var windowWidth;

        if (window.self.innerWidth) {
            if(document.documentElement.clientWidth){
                windowWidth = document.documentElement.clientWidth;
            } else {
                windowWidth = window.self.innerWidth;
            }
        } else if (document.documentElement && document.documentElement.clientWidth) {
            windowWidth = document.documentElement.clientWidth;
        } else if (document.body) {
            windowWidth = document.body.clientWidth;
        }

        if(xScroll < windowWidth){
            return xScroll;
        } else {
            return windowWidth;
        }
    },

    /**
     * @function ?
     * @return {int} page height
     */
    pageHeight: function() {
        var yScroll;

        if (window.innerHeight && window.scrollMaxY) {
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight){
            yScroll = document.body.scrollHeight;
        } else {
            yScroll = document.body.offsetHeight;
        }

        var windowHeight;

        if (window.self.innerHeight) {
            windowHeight = window.self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) {
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) {
            windowHeight = document.body.clientHeight;
        }

        if(yScroll < windowHeight){
            return windowHeight;
        } else {
            return yScroll;
        }
    },

   /**
     * @function ?
     * @return {int} viewport width
     */
    viewportWidth: function() {
        if(typeof window.innerWidth !== "undefined") {
            return window.innerWidth;
        }
        if (document.documentElement && typeof document.documentElement.offsetWidth !== "undefined") {
            return document.documentElement.offsetWidth;
        }
    },

    /**
     * @function ?
     * @return {int} viewport height
     */
    viewportHeight: function() {
        if (typeof window.innerHeight !== "undefined") {
            return window.innerHeight;
        }
        if (document.documentElement && typeof document.documentElement.offsetHeight !== "undefined") {
            return document.documentElement.offsetHeight;
        }
    },

    /**
     * @function ?
     * @return {int} scroll width
     */
    scrollWidth: function() {
        if (typeof window.self.pageXOffset !== 'undefined') {
            return window.self.pageXOffset;
        }
        if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.scrollLeft !== 'undefined') {
            return document.documentElement.scrollLeft;
        }
        return document.body.scrollLeft;
    },

    /**
     * @function ?
     * @return {int} scroll height
     */
    scrollHeight: function() {
        if (typeof window.self.pageYOffset !== 'undefined') {
            return window.self.pageYOffset;
        }
        if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.scrollTop !== 'undefined') {
            return document.documentElement.scrollTop;
        }
        return document.body.scrollTop;
    }
};

return Element;

});
