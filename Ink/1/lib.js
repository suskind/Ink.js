(function() {

    /**
     * global object
     *
     * @class Ink
     * @static
     */


    // skip redefinition of Ink core
    if ('Ink' in window) { return; }


    // internal data
    var paths = {
        //Ink: 'http://127.0.0.1:8000/Ink/'
        Ink: 'http://inkjs.gamblap/Ink/'
    };
    var modules = {};
    var modulesLoadOrder = [];
    var modulesRequested = {};
    var pendingRMs = [];



    // auxiliary fns
    var isEmptyObject = function(o) {
        if (typeof o !== 'object') { return false; }
        for (var k in o) {
            return false;
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
            var parts = modName.replace(/_/g, '.').split('.');
            var root = parts.shift();
            var uriPrefix = paths[root];
            if (!uriPrefix) {
                uriPrefix = './' + root + '/';
                console.warn('Not sure where to fetch ' + root + ' modules from! Attempting ' + uriPrefix + '...');
            }
            return [uriPrefix, parts.join('/'), '/lib.js'].join('');
        },

        setPath: function(key, rootURI) {
            paths[key] = rootURI;
        },

        /**
         * loads a javascript script in the head.
         *
         * @method loadScript
         * @param  {String}   uri       can be an http URI or a module name
         */
        loadScript: function(uri) {
            /*jshint evil:true */

            var scriptEl = document.createElement('script');
            scriptEl.setAttribute('type', 'text/javascript');
            scriptEl.setAttribute('src', this._modNameToUri(uri));

            if (document.readyState !== 'complete') {
                document.write( scriptEl.outerHTML );
            }
            else {
                document.head.appendChild(scriptEl);
            }
        },

        /**
         * defines a namespace.
         *
         * @method namespace
         * @param  {String}            ns
         * @param  {optional Boolean}  returnParentAndKey
         * @return if returnParentAndKey, returns [parent, lastPart], otherwise return the namespace directly
         */
        namespace: function(ns, returnParentAndKey) {
            if (!ns || !ns.length) { return null; }

            var levels = ns.split('.');
            var nsobj = window;
            var parent;

            for (var i = 0, f = levels.length; i < f; ++i) {
                nsobj[ levels[i] ] = nsobj[ levels[i] ] || {};
                parent = nsobj;
                nsobj = nsobj[ levels[i] ];
            }

            if (returnParentAndKey) {
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
            var key = version ? [mod, '_', version].join('') : mod;
            return modules[key];
        },

        /**
         * must be the wrapper around each Ink lib module for require resolution
         *
         * @method createModule
         * @param  {String}    mod    module name. parts are split with dots
         * @param  {Number}    version
         * @param  {String[]}  deps   array of module names which are dependencies for the module being created
         * @param  {Function}  modFn  its arguments are the resolved dependecies, once all of them are fetched. the body of this function should return the module.
         */
        createModule: function(mod, ver, deps, modFn) { // define
            var cb = function() {
                /*global console:false */

                //console.log(['createModule(', mod, ', ', ver, ', [', deps.join(', '), '], ', !!modFn, ')'].join(''));


                // validate version correctness
                if (typeof ver === 'number' || (typeof ver === 'string' && ver.length > 0)) {
                }
                else {
                    throw new Error('version must be passed!');
                }

                var modAll = [mod, '_', ver].join('');


                // make sure module in not loaded twice
                if (modules[modAll]) {
                    console.warn(['Ink.createModule ', modAll, ': module has been defined already.'].join(''));

                    /*if (this) { // there may be pending requires expecting this module, check...
                        Ink._checkPendingRequireModules();
                    }*/
                    return;
                }


                // delete related pending tasks
                delete modulesRequested[modAll];
                delete modulesRequested[mod];


                // run module's supplied factory
                var args = Array.prototype.slice.call(arguments);
                var moduleContent = modFn.apply(window, args);
                modulesLoadOrder.push(modAll);
                console.log('** loaded module ' + modAll + '**');


                // set version
                if (typeof moduleContent === 'object') { // Dom.Css Dom.Event
                    moduleContent._version = ver;
                }
                else if (typeof moduleContent === 'function') {
                    moduleContent.prototype._version = ver; // if constructor
                    moduleContent._version = ver;           // if regular function
                }


                // add to global namespace...
                var isInkModule = mod.indexOf('Ink.') === 0;
                var t;
                if (isInkModule) {
                    t = Ink.namespace(mod, true); // for mod 'Ink.Dom.Css', t[0] gets 'Ink.Dom' object and t[1] 'Css'
                }
  

                // versioned
                modules[ modAll ] = moduleContent; // in modules

                if (isInkModule) {
                    t[0][ t[1] + '_' + ver ] = moduleContent; // in namespace
                }
                

                // unversioned
                modules[ mod ] = moduleContent; // in modules
                
                if (isInkModule) {
                    if (isEmptyObject( t[0][ t[1] ] )) {
                        t[0][ t[1] ] = moduleContent; // in namespace
                    }
                    else {
                        console.warn(['Ink.createModule ', modAll, ': module has been defined already with a different version!'].join(''));
                    }
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
            //console.log(['requireModules([', deps.join(', '), '], ', !!cbFn, ')'].join(''));
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
        },

        bind: function(fn, context) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function() {
                var innerArgs = Array.prototype.slice.call(arguments);
                var finalArgs = args.concat(innerArgs);
                return fn.apply(context, finalArgs);
            };
        },

        bindEvent: function(fn, context) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function(event) {
                var finalArgs = args.slice();
                finalArgs.unshift(event || window.event);
                return fn.apply(context, finalArgs);
            };
        },

        i: function(id) {
            if(typeof(id) === 'string') {
                return document.getElementById(id);
            }
            return id;
        },

        /* Dom.Selector would override these methods for non-supporting browsers */
        s: function(rule, from) {
            var qs = document.querySelector;
            if (!qs) { throw new Error('Your browser does not support document.querySelector(). Require the module "Ink.Dom.Selector".'); }
            return qs.call(from || document, rule);
        },

        /* Dom.Selector would override these methods for non-supporting browsers */
        ss: function(rule, from) {
            var qsa = document.querySelectorAll;
            if (!qsa) { throw new Error('Your browser does not support document.querySelectorAll(). Require the module "Ink.Dom.Selector".'); }
            var nodeList = qsa.call(from || document, rule);
            return Array.prototype.slice.call(nodeList); // to mimic selector, which returns an array
        },

        extendObj: function(destination, source) 
        {
            if (source) {
                for (var property in source) {
                    if(source.hasOwnProperty(property)){
                        destination[property] = source[property];
                    }
                }
            }
            return destination;
        },

        Browser: {
            IE: true,
            GECKO: true,
            SAFARI: true,
            OPERA: false,
            CHROME: true,
            KONQUEROR: true,
            modle: '',
            version: '',
            userAgent: ''
        }


    };



    // TODO TEMP - to detect pending stuff
    var failCount = {};   // fail count per module name
    var maxFails = 3;     // times
    var checkDelta = 0.5; //seconds

    var tmpTmr = setInterval(function() {
        var mk = Object.keys(modulesRequested);
        var l = mk.length;

        if (l > 0) {
            console.log('** waiting for modules: ' + mk.join(', ') + ' **');

            for (var i = 0, f = mk.length, k, v; i < f; ++i) {
                k = mk[i];
                v = failCount[k];
                failCount[k] = (v === undefined) ? 1 : ++v;

                if (v >= maxFails) {
                    console.error('** Loading of module ' + k + ' failed! **');
                    delete modulesRequested[k];
                }
            }
        }
        else {
            console.log('** Module loads complete. **');
            clearInterval(tmpTmr);
        }
    }, checkDelta*1000);

})();
