/**
 * @module Ink.Dom.FormSerialize
 * @author inkdev AT sapo.pt
 */
/*jshint forin:true */
/*global Ink:false*/

SAPO.namespace('Utility');


/**
 * @class Ink.Dom.FormSerialize
 * @static
 *
 * Supports serialization of form data to/from JSON format.
 *
 * Valid applications are ad hoc AJAX/syndicated submission of forms, restoring form values from server side state, etc.
 */
SAPO.Utility.FormSerialize = {

    /**
     * @method {Object} ? returns a map of fieldName -> String|String[]|Boolean
     * (only select multiple and checkboxes with multiple values return arrays)
     * @param {DomElement|String}    form - form element from which the extraction is to occur
     */
    serialize: function(form) {
        form = s$(form);
        var map = this._getFieldNameInputsMap(form);

        var map2 = {};
        for (var k in map) {
            if(k != null) {
                var tmpK = k.replace(/\[\]$/, '');
                map2[tmpK] = this._getValuesOfField( map[k] );
            } else {
                map2[k] = this._getValuesOfField( map[k] );
            }
        }

        delete map2['null'];    // this can occur. if so, delete it...
        return map2;
    },




    /**
     * @method ? sets form elements with values given from object
     * One cannot restore the values of an input of type file (browser prohibits it)
     * @param {DomElement|String}    form - form element which is to be populated
     * @param {Object}                map2 - map of fieldName -> String|String[]|Boolean
     */
    fillIn: function(form, map2) {
        form = s$(form);
        var map = this._getFieldNameInputsMap(form);
        delete map['null']; // this can occur. if so, delete it...

        for (var k in map2) {
            this._setValuesOfField( map[k], map2[k] );
        }
    },



    _getFieldNameInputsMap: function(formEl) {
        var name, nodeName, el, map = {};
        for (var i = 0, f = formEl.elements.length; i < f; ++i) {
            el = formEl.elements[i];
            name = el.getAttribute('name');
            nodeName = el.nodeName.toLowerCase();
            if (nodeName === 'fieldset') {
                continue;
            } else if (map[name] === undefined) {
                map[name] = [el];
            } else {
                map[name].push(el);
            }
        }
        return map;
    },



    _getValuesOfField: function(fieldInputs) {
        var nodeName = fieldInputs[0].nodeName.toLowerCase();
        var type = fieldInputs[0].getAttribute('type');
        var value = fieldInputs[0].value;
        var i, f, el, res = [];

        switch(nodeName) {
            case 'select':
                if (fieldInputs.length > 1) {    throw 'Got multiple select elements with same name!';    }
                for (i = 0, f = fieldInputs[0].options.length; i < f; ++i) {
                    el = fieldInputs[0].options[i];
                    if (el.selected) {
                        res.push(    el.value    );
                    }
                }
                return ( (fieldInputs[0].getAttribute('multiple')) ?  res : res[0] );

            case 'textarea':
            case 'input':
                if (type === 'checkbox' || type === 'radio') {
                    for (i = 0, f = fieldInputs.length; i < f; ++i) {
                        el = fieldInputs[i];
                        if (el.checked) {
                            res.push(    el.value    );
                        }
                    }
                    if (type === 'checkbox') {
                        return (fieldInputs.length > 1) ? res : !!(res.length);
                    }
                    return (fieldInputs.length > 1) ? res[0] : !!(res.length);    // on radios only 1 option is selected at most
                }
                else {
                    //if (fieldInputs.length > 1) {    throw 'Got multiple input elements with same name!';    }
                    if(fieldInputs.length > 0 && /\[[^\]]*\]$/.test(fieldInputs[0].getAttribute('name'))) {
                        var tmpValues = [];
                        for(i=0, f = fieldInputs.length; i < f; ++i) {
                            tmpValues.push(fieldInputs[i].value);
                        }
                        return tmpValues;
                    } else {
                        return value;
                    }
                }
                break;    // to keep JSHint happy...  (reply to this comment by gamboa: - ROTFL)

            default:
                //throw 'Unsupported element: "' + nodeName + '"!';
                return undefined;
        }
    },



    _valInArray: function(val, arr) {
        for (var i = 0, f = arr.length; i < f; ++i) {
            if (arr[i] === val) {    return true;    }
        }
        return false;
    },



    _setValuesOfField: function(fieldInputs, fieldValues) {
        if (!fieldInputs) {    return;    }
        var nodeName = fieldInputs[0].nodeName.toLowerCase();
        var type = fieldInputs[0].getAttribute('type');
        var i, f, el;

        switch(nodeName) {
            case 'select':
                if (fieldInputs.length > 1) {    throw 'Got multiple select elements with same name!';    }
                for (i = 0, f = fieldInputs[0].options.length; i < f; ++i) {
                    el = fieldInputs[0].options[i];
                    el.selected = (fieldValues instanceof Array) ? this._valInArray(el.value, fieldValues) : el.value === fieldValues;
                }
                break;

            case 'textarea':
            case 'input':
                if (type === 'checkbox' || type === 'radio') {
                    for (i = 0, f = fieldInputs.length; i < f; ++i) {
                        el = fieldInputs[i];
                        //el.checked = (fieldValues instanceof Array) ? this._valInArray(el.value, fieldValues) : el.value === fieldValues;
                        el.checked = (fieldValues instanceof Array) ? this._valInArray(el.value, fieldValues) : (fieldInputs.length > 1 ? el.value === fieldValues : !!fieldValues);
                    }
                }
                else {
                    if (fieldInputs.length > 1) {    throw 'Got multiple input elements with same name!';    }
                    if (type !== 'file') {
                        fieldInputs[0].value = fieldValues;
                    }
                }
                break;

            default:
                throw 'Unsupported element: "' + nodeName + '"!';
        }
    }

};
