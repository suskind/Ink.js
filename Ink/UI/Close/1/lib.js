/**
 * @module Ink.UI.Close_1
 * @author inkdev AT sapo.pt
 */
Ink.createModule('Ink.UI.Close', '1', ['Ink.Dom.Event_1','Ink.Dom.Css_1'], function(InkEvent, Css) {
    'use strict';

    /**
     * Subscribes clicks on the document.body. If and only if you clicked on an element
     * having class "ink-close" or "ink-dismiss", will go up the DOM hierarchy looking for an element with any
     * of the following classes: "ink-alert", "ink-alert-block".
     * If it is found, it is removed from the DOM.
     * 
     * One should call close once per page (full page refresh).
     * 
     * @class Ink.UI.Close
     * @constructor
     * @uses Ink.Dom.Event
     * @uses Ink.Dom.Css
     * @example
     *     <script>
     *         Ink.requireModules(['Ink.UI.Close_1'],function( Close ){
     *             new Close();
     *         });
     *     </script>
     */
    var Close = function() {
        InkEvent.observe(document.body, 'click', function(ev) {
            var el = InkEvent.element(ev);

            while (el !== null) {
                if (Css.hasClassName(el, 'ink-close') || Css.hasClassName(el, 'ink-dismiss')) {
                    break;
                }
                el = el.parentNode;
            }
            if (el === null) {
                return;  // ink-close or ink-dismiss class not found
            }

            do {
                if (Css.hasClassName(el, 'ink-alert') || Css.hasClassName(el, 'ink-alert-block')) {
                    break;
                }
            } while ((el = el.parentNode));

            if (el) {
                InkEvent.stop(ev);
                el.parentNode.removeChild(el);
            }
        });
    };

    return Close;

});
