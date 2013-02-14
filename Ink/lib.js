(function() {

    /**
     * global object
     *
     * @class Ink
     * @static
     */


    // skip redefinition of Ink core
    if ('Ink' in window) {
        return;
    }


    // internal data
    var modules = {};
    var modulesLoadOrder = [];
    var modulesRequested = {};
    var pendingRMs = [];



    // auxiliary fns
    var isEmptyObject = function(o) {
        if (typeof o !== 'object') { return false; }
        for (var k in o) {
            return !k; // false
        }
        return true;
    };



    window.Ink = {

        _checkPendingRequireModules: function() {
            var I, F, o, dep, mod, cb, pRMs = [];
            for (I = 0, F = pendingRMs.length; I < F; ++I) {
                o = pendingRMs[I];

                if (!o) { continue; }

                for (dep in o.left) {
                    mod = modules[dep];
                    if (mod) {
                        o.args[o.left[dep] ] = mod;
                        delete o.left[dep];
                        --o.remaining;
                    }
                }

                if (o.remaining > 0) {
                    pRMs.push(o);
                }
                else {
                    cb = o.cb;
                    if (!cb) { continue; }
                    delete o.cb; // to make sure I won't call this more than once!
                    cb.apply(false, o.args);
                }
            }

            pendingRMs = pRMs;

            if (pendingRMs.length > 0) {
                setTimeout( function() { Ink._checkPendingRequireModules(); }, 0 );
            }
        },

        _modNameToUri: function(modName) {
            if (modName.indexOf('/') !== -1) {
                return modName;
            }
            var parts = modName.split('.');
            parts = ['http://127.0.0.1:8000/Ink/', parts.join('/'), '/lib.js'];
            return parts.join('');
        },

        _extractVersion: function(modName) {
            var parts = modName.split('.');
            var version = parts.pop();
            version = parseInt(version, 10);
            if (!isNaN(version)) {
                return [parts.join('.'), version];
            }
            return [modName, undefined];
        },

        /**
         * loads a javascript script in the head.
         *
         * @method loadScript
         * @param  {String}  uri  can be an http URI or a module name
         */
        loadScript: function(uri) {
            var scriptEl = document.createElement('script');
            scriptEl.setAttribute('type', 'text/javascript');
            scriptEl.setAttribute('src', this._modNameToUri(uri));
            document.head.appendChild(scriptEl);
        },

        /**
         * defines an Ink namespace.
         *
         * @method namespace
         * @param  {String}            ns
         * @param  {optional Boolean}  returnParentInstead
         * @return if returnParentInstead, returns [parent, lastPart], otherwise return the namespace directly
         */
        namespace: function(ns, returnParentInstead) {
            if (!ns || !ns.length) { return null; }

            var levels = ns.split('.');
            var nsobj = Ink;
            var parent;

            // Ink is implied, so it is ignored if it is included
            for (var i = (levels[0] === 'Ink') ? 1 : 0; i < levels.length; ++i) {
                nsobj[ levels[i] ] = nsobj[ levels[i] ] || {};
                parent = nsobj;
                nsobj = nsobj[ levels[i] ];
            }

            if (returnParentInstead) {
                return [
                    parent,
                    levels[i-1]
                ];
            }

            return nsobj;
        },

        /**
         * synchronous. assumes module is loaded already!
         *
         * @method getModule
         * @param  {String}           mod
         * @param  {optional Number}  version
         * @return {Object|Function} module object / function
         */
        getModule: function(mod, version) {
            var modParts;
            if (version !== undefined) {
                modParts = [mod, parseInt(version, 10)];
                mod = modParts.join('.');
            }
            else {
                modParts = this._extractVersion(mod);
            }
            return modules[mod];
        },

        /**
         * must be the wrapper around each Ink lib module for require resolution
         *
         * @method createModule
         * @param  {String}    mod    module name. parts are split with dots, must end with version number
         * @param  {String[]}  deps   array of module names which are dependencies for the module being created
         * @param  {Function}  modFn  its arguments are the resolved dependecies, once all of them are fetched. the body of this function should return the module.
         */
        createModule: function(mod, deps, modFn) { // define
            var cb = function() {
                /*global console:false */

                delete modulesRequested[mod];

                var args = Array.prototype.slice.call(arguments);
                var moduleContent = modFn.apply(window, args);
                modules[mod] = moduleContent;
                modulesLoadOrder.push(mod);
                console.log('** loaded module ' + mod + '**');


                // add to global namespace...
                var modParts = Ink._extractVersion(mod);
                var namespace = modParts[0];
                var version   = modParts[1];
                if (typeof version !== 'number') {
                    throw new Error('Module name (1st argument) must have a version number suffix!');
                }


                // set version
                if (typeof moduleContent === 'object') { // Dom.Css Dom.Event
                    moduleContent._version = version;
                }
                else if (typeof moduleContent === 'function') {
                    moduleContent.prototype._version = version; // if constructor
                    moduleContent._version = version;           // if regular function
                }
                console.log(mod);
                

                // define versioned
                var t = Ink.namespace(namespace, true); // t[0] gets 'Component.Slider' and t[1] 1
                t[0][ t[1] + '_' + version ] = moduleContent;

                //check if unversioned object is defined...
                if (isEmptyObject( t[0][ t[1] ] )) {
                    // it isn't, define unversioned too
                    t[0][ t[1] ]         = moduleContent;
                    modules[ namespace ] = moduleContent;
                }

                if (this) { // there may be pending requires expecting this module, check...
                    Ink._checkPendingRequireModules();
                }
            };

            this.requireModules(deps, cb);
        },

        /**
         * use this to get depencies, even if they're not loaded yet
         *
         * @method requireModules
         * @param  {String[]}  deps  array of module names which are dependencies for the require function body
         * @param  {Function}  cbFn  its arguments are the resolved dependecies, once all of them are fetched
         */
        requireModules: function(deps, cbFn) { // require
            var i, f, o, dep, mod;
            f = deps.length;
            o = {
                args: new Array(f),
                left: {},
                remaining: f,
                cb: cbFn
            };

            for (i = 0; i < f; ++i) {
                dep = deps[i];
                mod = modules[dep];
                if (mod) {
                    o.args[i] = mod;
                    --o.remaining;
                    continue;
                }
                else if (modulesRequested[dep]) {
                }
                else {
                    modulesRequested[dep] = true;
                    Ink.loadScript(dep);
                }
                o.left[dep] = i;
            }

            if (o.remaining > 0) {
                pendingRMs.push(o);
            }
            else {
                cbFn.apply(true, o.args);
            }
        },

        /**
         * list or module names, ordered by loaded time
         *
         * @method getModulesLoadOrder
         * @return {String[]} returns the order in which modules were resolved and correctly loaded
         */
        getModulesLoadOrder: function() {
            return modulesLoadOrder.slice();
        }

    };

})();
