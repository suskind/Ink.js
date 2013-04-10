/**
 * @author: inkdev AT sapo.pt
 */

Ink.createModule('Ink.Dom.Event', 1, [], function() {

'use strict';

/**
 */
var Event = {

    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,


    /**
     * @function {Node} ? - Returns the target of the event object
     * @param {Object} ev - event object
     * @return The target
     */
    element: function(ev)
    {
        var node = ev.target ||
            // IE stuff
            (ev.type === 'mouseout'   && ev.fromElement) ||
            (ev.type === 'mouseleave' && ev.fromElement) ||
            (ev.type === 'mouseover'  && ev.toElement) ||
            (ev.type === 'mouseenter' && ev.toElement) ||
            ev.srcElement ||
            null;
        return node && (node.nodeType === 3 || node.nodeType === 4) ? node.parentNode : node;
    },

    /**
     * @function {Node} ? - Returns the related target of the event object
     * @param {Object} ev - event object
     * @return The related target
     */
    relatedTarget: function(ev){
        var node = ev.relatedTarget ||
            // IE stuff
            (ev.type === 'mouseout'   && ev.toElement) ||
            (ev.type === 'mouseleave' && ev.toElement) ||
            (ev.type === 'mouseover'  && ev.fromElement) ||
            (ev.type === 'mouseenter' && ev.fromElement) ||
            null;
        return node && (node.nodeType === 3 || node.nodeType === 4) ? node.parentNode : node;
    },

    /**
     * @function {DOMElement} ?
     * @param {Object} ev - event object
     * @param {String} elmTagName - tag name to find
     * @param {Boolean} force - force the return of the wanted type of tag,
     * or false otherwise
     * @return the first element which matches given tag name or the
     * document element if the wanted tag is not found
     */
    findElement: function(ev, elmTagName, force)
    {
        var node = this.element(ev);
        while(true) {
            if(node.nodeName.toLowerCase() === elmTagName.toLowerCase()) {
                return node;
            } else {
                node = node.parentNode;
                if(!node) {
                    if(force) {
                        return false;
                    }
                    return document;
                }
                if(!node.parentNode){
                    if(force){ return false; }
                    return document;
                }
            }
        }
    },


    /**
     * @function ? Dispatch an event to element
     * @param {DOMElement|String} element - element id or element
     * @param {String} eventName - event name
     * @param {Object} memo - metadata for the event
     */
    fire: function(element, eventName, memo)
    {
        element = Ink.i(element);
        var ev, nativeEvents;
        if(document.createEvent){
            nativeEvents = {
                "DOMActivate": true, "DOMFocusIn": true, "DOMFocusOut": true,
                "focus": true, "focusin": true, "focusout": true,
                "blur": true, "load": true, "unload": true, "abort": true,
                "error": true, "select": true, "change": true, "submit": true,
                "reset": true, "resize": true, "scroll": true,
                "click": true, "dblclick": true, "mousedown": true,
                "mouseenter": true, "mouseleave": true, "mousemove": true, "mouseover": true,
                "mouseout": true, "mouseup": true, "mousewheel": true, "wheel": true,
                "textInput": true, "keydown": true, "keypress": true, "keyup": true,
                "compositionstart": true, "compositionupdate": true, "compositionend": true,
                "DOMSubtreeModified": true, "DOMNodeInserted": true, "DOMNodeRemoved": true,
                "DOMNodeInsertedIntoDocument": true, "DOMNodeRemovedFromDocument": true,
                "DOMAttrModified": true, "DOMCharacterDataModified": true,
                "DOMAttributeNameChanged": true, "DOMElementNameChanged": true,
                "hashchange": true
            };
        } else {
            nativeEvents = {
                "onabort": true, "onactivate": true, "onafterprint": true, "onafterupdate": true,
                "onbeforeactivate": true, "onbeforecopy": true, "onbeforecut": true,
                "onbeforedeactivate": true, "onbeforeeditfocus": true, "onbeforepaste": true,
                "onbeforeprint": true, "onbeforeunload": true, "onbeforeupdate": true, "onblur": true,
                "onbounce": true, "oncellchange": true, "onchange": true, "onclick": true,
                "oncontextmenu": true, "oncontrolselect": true, "oncopy": true, "oncut": true,
                "ondataavailable": true, "ondatasetchanged": true, "ondatasetcomplete": true,
                "ondblclick": true, "ondeactivate": true, "ondrag": true, "ondragend": true,
                "ondragenter": true, "ondragleave": true, "ondragover": true, "ondragstart": true,
                "ondrop": true, "onerror": true, "onerrorupdate": true,
                "onfilterchange": true, "onfinish": true, "onfocus": true, "onfocusin": true,
                "onfocusout": true, "onhashchange": true, "onhelp": true, "onkeydown": true,
                "onkeypress": true, "onkeyup": true, "onlayoutcomplete": true,
                "onload": true, "onlosecapture": true, "onmessage": true, "onmousedown": true,
                "onmouseenter": true, "onmouseleave": true, "onmousemove": true, "onmouseout": true,
                "onmouseover": true, "onmouseup": true, "onmousewheel": true, "onmove": true,
                "onmoveend": true, "onmovestart": true, "onoffline": true, "ononline": true,
                "onpage": true, "onpaste": true, "onprogress": true, "onpropertychange": true,
                "onreadystatechange": true, "onreset": true, "onresize": true,
                "onresizeend": true, "onresizestart": true, "onrowenter": true, "onrowexit": true,
                "onrowsdelete": true, "onrowsinserted": true, "onscroll": true, "onselect": true,
                "onselectionchange": true, "onselectstart": true, "onstart": true,
                "onstop": true, "onstorage": true, "onstoragecommit": true, "onsubmit": true,
                "ontimeout": true, "onunload": true
            };
        }


        if(element !== null){
            if (element === document && document.createEvent && !element.dispatchEvent) {
                element = document.documentElement;
            }

            if (document.createEvent) {
                ev = document.createEvent("HTMLEvents");
                if(typeof nativeEvents[eventName] === "undefined"){
                    ev.initEvent("dataavailable", true, true);
                } else {
                    ev.initEvent(eventName, true, true);
                }

            } else {
                ev = document.createEventObject();
                if(typeof nativeEvents["on"+eventName] === "undefined"){
                    ev.eventType = "ondataavailable";
                } else {
                    ev.eventType = "on"+eventName;
                }
            }

            ev.eventName = eventName;
            ev.memo = memo || { };

            try {
                if (document.createEvent) {
                    element.dispatchEvent(ev);
                } else if(element.fireEvent){
                    element.fireEvent(ev.eventType, ev);
                } else {
                    return;
                }
            } catch(ex) {}

            return ev;
        }
    },

    /**
     * @function ? Attach an event to element
     * @param {DOMElement|String} element - element id or element
     * @param {String} eventName - event name
     * @param {Function} callBack - Receives event object as a
     * parameter. If you're manually firing custom events, check the
     * eventName property of the event object to make sure you're handling
     * the right event.
     * @param {Boolean} useCapture - set to true to change event listening from bubbling to capture.
     */
    observe: function(element, eventName, callBack, useCapture)
    {
        element = Ink.i(element);
        if(element !== null) {
            if(eventName.indexOf(':') !== -1 ||
                (eventName === "hashchange" && element.attachEvent && !window.onhashchange)
                ) {

                /**
                 *
                 * prevent that each custom event fire without any test
                 * This prevents that if you have multiple custom events
                 * on dataavailable to trigger the callback event if it
                 * is a different custom event
                 *
                 */
                var argCallback = callBack;
                callBack = Ink.bindEvent(function(ev, eventName, cb){

                  //tests if it is our event and if not
                  //check if it is IE and our dom:loaded was overrided (IE only supports one ondatavailable)
                  //- fix /opera also supports attachEvent and was firing two events
                  if(ev.eventName === eventName || (Ink.Browser.IE && eventName === 'dom:loaded')){
                    //fix for FF since it loses the event in case of using a second binObjEvent
                    if(window.addEventListener){
                      window.event = ev;
                    }
                    cb();
                  }

                }, this, eventName, argCallback);

                eventName = 'dataavailable';
            }






            if(element.addEventListener) {
                element.addEventListener(eventName, callBack, !!useCapture);
            } else {
                element.attachEvent('on' + eventName, callBack);
            }
        }
    },

    /**
     * @function ? Remove an event attached to an element
     * @param {DOMElement|String} element - element id or element
     * @param {String} eventName - event name
     * @param {Function} callBack - callback function
     * @param {Boolean} useCapture - set to true if the event was being observed with useCapture set to true as well.
     */
    stopObserving: function(element, eventName, callBack, useCapture)
    {
        element = Ink.i(element);

        if(element !== null) {
            if(element.removeEventListener) {
                element.removeEventListener(eventName, callBack, !!useCapture);
            } else {
                element.detachEvent('on' + eventName, callBack);
            }
        }
    },

    /**
     * @function ? stops event propagation and bubbling
     * @param {Object} event - event handle
     */
    stop: function(event)
    {
        if(event.cancelBubble !== null) {
            event.cancelBubble = true;
        }
        if(event.stopPropagation) {
            event.stopPropagation();
        }
        if(event.preventDefault) {
            event.preventDefault();
        }
        if(window.attachEvent) {
            event.returnValue = false;
        }
        if(event.cancel !== null) {
            event.cancel = true;
        }
    },

    /**
     * @function ? stops event default behaviour
     * @param {Object} event - event handle
     */
    stopDefault: function(event)
    {
        if(event.preventDefault) {
            event.preventDefault();
        }
        if(window.attachEvent) {
            event.returnValue = false;
        }
        if(event.cancel !== null) {
            event.cancel = true;
        }
    },

    /**
     * @function {Object} ?
     * @param {Object} ev - event object
     * @return an object with the mouse X and Y position
     */
    pointer: function(ev)
    {
        return {
                x: ev.pageX || (ev.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
                y: ev.pageY || (ev.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
        };
    },

    /**
     * @function {Number} ?
     * @param {Object} ev - event object
     * @return mouse X position
     */
    pointerX: function(ev)
    {
        return this.pointer(ev).x;
    },

    /**
     * @function {Number} ?
     * @param {Object} ev - event object
     * @return mouse Y position
     */
    pointerY: function(ev)
    {
        return this.pointer(ev).y;
    },

    /**
     * @function {Boolean} ?
     * @param {Object} ev - event object
     * @return True if there is a left click on the event
     */
    isLeftClick: function(ev) {
        if (window.addEventListener) {
            if(ev.button === 0){
                return true;
            }
            else if(ev.type.substring(0,5) === 'touch' && ev.button === null){
                return true;
            }
        }
        else {
            if(ev.button === 1){ return true; }
        }
        return false;
    },

    /**
     * @function {Boolean} ?
     * @param {Object} ev - event object
     * @return True if there is a right click on the event
     */
    isRightClick: function(ev) {
        if(ev.button === 2){ return true; }
        return false;
    },

    /**
     * @function {Boolean} ?
     * @param {Object} ev - event object
     * @return True if there is a middle click on the event
     */
    isMiddleClick: function(ev) {
        if (window.addEventListener) {
            if(ev.button === 1){ return true; }
        }
        else {
            if(ev.button === 4){ return true; }
        }
        return false;
    },

    /**
     * Work in Progress.
     * Used in SAPO.Component.MaskedInput
     * @function {String} ?
     * @param {KeyboardEvent}       event           - keyboard event
     * @param {optional Boolean}    changeCasing    - if true uppercases, if false lowercases, otherwise keeps casing
     * @return character representation of pressed key combination
     */
    getCharFromKeyboardEvent: function(event, changeCasing) {
        var k = event.keyCode;
        var c = String.fromCharCode(k);

        var shiftOn = event.shiftKey;
        if (k >= 65 && k <= 90) {   // A-Z
            if (typeof changeCasing === 'boolean') {
                shiftOn = changeCasing;
            }
            return (shiftOn) ? c : c.toLowerCase();
        }
        else if (k >= 96 && k <= 105) { // numpad digits
            return String.fromCharCode( 48 + (k-96) );
        }
        switch (k) {
            case 109:   case 189:   return '-';
            case 107:   case 187:   return '+';
        }
        return c;
    },

    debug: function(){}
};

return Event;

});
