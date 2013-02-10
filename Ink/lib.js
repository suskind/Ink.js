/*jshint browser:true, eqeqeq:true, undef:true, curly:true, laxbreak:true, forin:false, smarttabs:true */
/*global Ink:false, s$:false */



if (typeof Ink === 'undefined') {
    window.Ink = {};
} else {
    window.Ink = window.Ink;
}

/**
 * @class Ink  
 */

/* {{{ Ink.namespace() */
/**
 * @function {Object} Ink.namespace Creates the Ink namespace
 * @param {string} ns - namespace path
 * @return Object with Ink namespace
 */
Ink.namespace = function(ns) {

    if (!ns || !ns.length) {
        return null;
    }

    var levels = ns.split(".");
    var nsobj = Ink;

    // Ink is implied, so it is ignored if it is included
    for (var i = (levels[0] === "Ink") ? 1 : 0; i < levels.length; ++i) {
        nsobj[levels[i]] = nsobj[levels[i]] || {};
        nsobj = nsobj[levels[i]];
    }

    return nsobj;
};
/* }}} */

/* check if class is already defined on page and new class will overwrite it */
Ink.isDefined = function() {
}

/* check if dependencies have been loaded */
Ink.depends = function() {
}

/* run class and return instance with params... It will run specific version */
Ink.runInstance = function(objectConstrutor, params) {
}

/* get specific class based on dependencies */
Ink.getClass = function(className) {
};

/* create a new class, if version is given and name is already defined, will create name based on version */
Ink.createClass = function(className, varObject, version) {
};


/* {{{ SAPO.verify() */ // TODO 
/**
 * @function {Object} SAPO.verify verifies that a dependency has been loaded.
 *                    Throws exception if not
 * @param {string} ns - namespace path
 * @param {string} minVersion - minimum version, optional
 * @return Object with SAPO namespace
 */
/*
SAPO.verify = function(ns, minVersion) {
    if (!ns) {
        return;
    }

    var levels = ns.split(".");
    var nsobj = SAPO;

    // SAPO is implied, so it is ignored if it is included
    for (var k = levels[0] === 'SAPO' ? 1 : 0, m = levels.length; k < m; k++) {
        nsobj = nsobj[levels[k]];
        if (!nsobj) {
            throw new Error('SAPO.verify: ' + ns + ' not found');
        }
    }

    if (!minVersion) {
        return;
    }

    if (typeof nsobj === 'function') {
        nsobj = nsobj.prototype;
    }

    var lhs = String(nsobj.version).match(/\d+/g) || [0];
    var rhs = String(minVersion).match(/\d+/g) || [0];
    for(k = 0, m = Math.min(lhs.length, rhs.length); k < m; k++) {
        if (lhs[k] < rhs[k]) {
            throw new Error('SAPO.verify: ' + ns+ ' has low version (' + nsobj.version + ' < ' + minVersion + ')');
        }
    }

    if (lhs.length < rhs.length) {
        throw new Error('SAPO.verify: ' + ns+ ' has low version (' + nsobj.version + ' < ' + minVersion + ')');
    }
};
*/
/* }}} */

/* {{{ SAPO.Class() */
/**
 * @function {Function} ? - This function returns a new Class (function) which
 * will create object instances with the given properties as prototype,
 * supporting hierarchy, using baseClass ad the base class.
 * If properties has a property named abstract which evaluates to true, then
 * the class cannot be instantiated directly, like an abstract class.
 *
 * @param {string}   class name, useful just for debugging.
 * @param baseClass  prototype, super class.
 * @param properties methods and properties of the new class.
 */
/* // TODO
SAPO.Class = function(name, baseClass, properties) {
    var derivedFunction = function () {
        if (this.__dont_init) {
            return;
        }

        if (this === window || !this) {
            throw new Error('Call "new ' + name + '(...);"');
        }

        if (derivedFunction['abstract']) {
            throw new Error("Abstract class: don't instantiate");
        }

        if (baseClass) {
            var abstractBackup = baseClass['abstract'];
            if (abstractBackup) {
                baseClass['abstract'] = false;
            }
            baseClass.apply(this, arguments);
            if (abstractBackup) {
                baseClass['abstract'] = abstractBackup;
            }
        }
        if (properties && typeof properties.init === 'function') {
            properties.init.apply(this, arguments);
        }
    };

    derivedFunction.name = derivedFunction.displayName = name;
    derivedFunction['abstract'] = properties['abstract'];

    if (baseClass) {
        // __dont_init used as workaround to prevent double initialization
        baseClass.prototype.__dont_init = 1;
        derivedFunction.prototype = new baseClass();
        delete baseClass.prototype.__dont_init;
    }

    derivedFunction.prototype.toString = function() {
        return '[object '+name+']';
    };

    if (properties) {
        SAPO.extendObj(derivedFunction.prototype, properties);
    }
    return derivedFunction;
};
*/
/* }}} */

/* {{{ SAPO.safeCall() */
/**
 * @function ? Safely calls a callback function. Verifies that
 *             the callback is well defined and traps errors.
 * @param {Object} object to be used as this. If null, the global object is used.
 *             If function, then it's called with window as this.
 * @param {String|Function} listener member function to be called. If string, then
 *             member is looked up.
 */
Ink.safeCall = function(object, listener) {
    function rethrow(exception){
        setTimeout(function() {
            // Rethrow exception so it'll land in
            // the error console, firebug, whatever.
            if (exception.message) {
                exception.message += '\n'+(exception.stacktrace || exception.stack || '');
            }
            throw exception;
        },1);
    }
    if (object === null) {
        object = window;
    }
    if (typeof listener === 'string' && typeof object[listener] === 'function') {
        try {
            return object[listener].apply(object, [].slice.call(arguments, 2));
        } catch(ex){
            rethrow(ex);
        }
    } else if (typeof listener === 'function') {
        try {
            return listener.apply(object, [].slice.call(arguments, 2));
        } catch(ex){
            rethrow(ex);
        }
    } else if (typeof object === 'function') {
        try {
            return object.apply(window, [].slice.call(arguments, 1));
        } catch(ex){
            rethrow(ex);
        }
    }
};
/* }}} */

/* {{{ s$() */
/**
 * @function {DOMElement|Array} s$ Shortcut for document.getElementById
 * @param {string|Array} element - Receives either an id or an Array of id's
 * @return Either the DOM element for the given id or an array of elements for the given ids
 */
window.s$ = function(element) {
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++) {
            elements.push(s$(arguments[i]));
        }
        return elements;
    }
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    return element;
};
/* }}} */

/* {{{ Function.bindObj() */
/**
 * @function {Function} bindObj Extends the native Function object.
 * Creates a delegate (callback) that sets the scope to obj.
 * Call directly on any function. <br />Example:
 * <code>this.myFunction.bindObj(this)</code> <br />
 * Will create a function that is automatically scoped to this.
 * @param {Object} obj The object for which the scope is set
 * @param {optional Array} args Overrides arguments for the call.
 * (Defaults to the arguments passed by the caller)
 * @return The new function
 */
if(typeof(Function.prototype.bindObj) === 'undefined') {
    Function.prototype.bindObj = function() {

        if (arguments.length < 2 && arguments[0] === undefined) {
            return this;
        }
        var __method = this;
        var args = [];
        for(var i=0, total=arguments.length; i < total; i++) {
            args.push(arguments[i]);
        }
        var object = args.shift();

        var fn = function() {
            return __method.apply(object, args.concat(function(tmpArgs){
                            var args2 = [];
                            for(var j=0, total=tmpArgs.length; j < total; j++) {
                                args2.push(tmpArgs[j]);
                            }
                            return args2;
                        }(arguments)));
        };
        fn.toString = function(){ return String(__method); };
        fn.name = fn.displayName = __method.name;
        return fn;
    };
}
/* }}} */

/* {{{ Function.bindObjEvent() */
/**
 * @function {Function} bindObjEvent Extends the native Function object.
 * Creates a delegate (callback) that sets the scope to obj.
 * Call directly on any function. <br />Example:
 * <code>this.myFunction.bindObjEvent(this)</code> <br />
 * Will create a function that is automatically scoped to this.
 * @param {Object} event The default event
 * @param {Object} obj The object for which the scope is set
 * @param {optional Array} args Overrides arguments for the call.
 * (Defaults to the arguments passed by the caller)
 * @return The new function
 */
if(typeof(Function.prototype.bindObjEvent) === 'undefined') {
    Function.prototype.bindObjEvent =  function() {
        var __method = this;
        var args = [];
        for(var i=0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        var object = args.shift();
        return function(event) {
            return __method.apply(object, [event || window.event].concat(args));
        };
    };
}
/* }}} */

/* {{{ Ink.extendObj() */
/**
 * @function {Object} ? Extends a given Object with a given set
 * of properties
 * @param {Object} destination - The original objecty
 * @param {Object} source - The new properties
 * @return The extended object
 */
Ink.extendObj = function(destination, source) {
    if (source) {
        for (var property in source) {
            if(source.hasOwnProperty(property)){
                destination[property] = source[property];
            }
        }
    }
    return destination;
};
/* }}} */

/* {{{ Ink.Browser */
/**
 * @class {private} Ink.Browser
 */
if (typeof Ink.Browser === 'undefined') {

    Ink.Browser = {
        /**
         * True if the browser is Internet Explorer
         * @var {boolean} ?
         */
        IE: false,

        /**
         * True if the browser is Gecko based
         * @var {boolean} ?
         */
        GECKO: false,

        /**
         * True if the browser is Opera
         * @var {boolean} ?
         */
        OPERA: false,

        /**
         * True if the browser is Safari
         * @var {boolean} ?
         */
        SAFARI: false,

        /**
         * True if the browser is Konqueror
         * @var {boolean} ?
         */
        KONQUEROR: false,

        /**
         * True if browser is Chrome
         * @var {boolean} ?
         */

        CHROME: false,

        /**
         * The specific browser model
         * @var {string} ?
         */
        model: false,

        /**
         * The browser version
         * @var {string} ?
         */
        version: false,

        /**
         * The user agent string
         * @var {string} ?
         */
        userAgent: false,

        /**
         * @function ? initialization function for the Browser object
         */
        init: function()
        {
            this.detectBrowser();
            this.setDimensions();
            this.setReferrer();
        },

        /**
         * @function ? Stores window dimensions
         */
        setDimensions: function()
        {
            //this.windowWidth=window.innerWidth !== null? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body !== null ? document.body.clientWidth : null;
            //this.windowHeight=window.innerHeight != null? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body != null? document.body.clientHeight : null;
            var myWidth = 0, myHeight = 0;
            if ( typeof window.innerWidth=== 'number' ) {
                myWidth = window.innerWidth;
                myHeight = window.innerHeight;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                myWidth = document.documentElement.clientWidth;
                myHeight = document.documentElement.clientHeight;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                myWidth = document.body.clientWidth;
                myHeight = document.body.clientHeight;
            }
            this.windowWidth = myWidth;
            this.windowHeight = myHeight;
        },

        /**
         * @function ? Stores the referrer
         */
        setReferrer: function()
        {
            this.referrer = document.referrer !== undefined? document.referrer.length > 0 ? window.escape(document.referrer) : false : false;
        },

        /**
         * @function ? Detects the browser and stores the found properties
         */
        detectBrowser: function()
        {
            var sAgent = navigator.userAgent;

            this.userAgent = sAgent;

            sAgent = sAgent.toLowerCase();

            if((new RegExp("applewebkit\/")).test(sAgent)) {

                if((new RegExp("chrome\/")).test(sAgent)) {
                    // Chrome
                    this.CHROME = true;
                    this.model = 'chrome';
                    this.version = sAgent.replace(new RegExp("(.*)chrome\/([^\\s]+)(.*)"), "$2");
                    this.cssPrefix = '-webkit-';
                    this.domPrefix = 'Webkit';
                } else {
                    // Safari
                    this.SAFARI = true;
                    this.model = 'safari';
                    this.version = sAgent.replace(new RegExp("(.*)applewebkit\/([^\\s]+)(.*)"), "$2");
                    this.cssPrefix = '-webkit-';
                    this.domPrefix = 'Webkit';
                }
            } else if((new RegExp("opera")).test(sAgent)) {
                // Opera
                this.OPERA = true;
                this.model = 'opera';
                this.version = sAgent.replace(new RegExp("(.*)opera.([^\\s$]+)(.*)"), "$2");
                this.cssPrefix = '-o-';
                this.domPrefix = 'O';
            } else if((new RegExp("konqueror")).test(sAgent)) {
                // Konqueror
                this.KONQUEROR = true;
                this.model = 'konqueror';
                this.version = sAgent.replace(new RegExp("(.*)konqueror\/([^;]+);(.*)"), "$2");
                this.cssPrefix = '-khtml-';
                this.domPrefix = 'Khtml';
            } else if((new RegExp("msie\\ ")).test(sAgent)) {
                // MSIE
                this.IE = true;
                this.model = 'ie';
                this.version = sAgent.replace(new RegExp("(.*)\\smsie\\s([^;]+);(.*)"), "$2");
                this.cssPrefix = '-ms-';
                this.domPrefix = 'ms';
            } else if((new RegExp("gecko")).test(sAgent)) {
                // GECKO
                // Supports only:
                // Camino, Chimera, Epiphany, Minefield (firefox 3), Firefox, Firebird, Phoenix, Galeon,
                // Iceweasel, K-Meleon, SeaMonkey, Netscape, Songbird, Sylera,
                this.GECKO = true;
                var re = new RegExp("(camino|chimera|epiphany|minefield|firefox|firebird|phoenix|galeon|iceweasel|k\\-meleon|seamonkey|netscape|songbird|sylera)");
                if(re.test(sAgent)) {
                    this.model = sAgent.match(re)[1];
                    this.version = sAgent.replace(new RegExp("(.*)"+this.model+"\/([^;\\s$]+)(.*)"), "$2");
                    this.cssPrefix = '-moz-';
                    this.domPrefix = 'Moz';
                } else {
                    // probably is mozilla
                    this.model = 'mozilla';
                    var reVersion = new RegExp("(.*)rv:([^)]+)(.*)");
                    if(reVersion.test(sAgent)) {
                        this.version = sAgent.replace(reVersion, "$2");
                    }
                    this.cssPrefix = '-moz-';
                    this.domPrefix = 'Moz';
                }
            }
        },

        debug: function()
        {
            /*global alert:false */
            var str = "known browsers: (ie, gecko, opera, safari, konqueror) \n";
                str += [this.IE, this.GECKO, this.OPERA, this.SAFARI, this.KONQUEROR] +"\n";
                str += "model -> "+this.model+"\n";
                str += "version -> "+this.version+"\n";
                str += "\n";
                str += "original UA -> "+this.userAgent;

                alert(str);
        }
    };

    Ink.Browser.init();

}
/* }}} */

/* {{{ Ink.logReferer() */
Ink.logReferer = function(classURL) {


    /*
    var thisOptions = {
                s:     (typeof options === 'object' && options.s'    ? options.s     : 'js.sapo.pt',
                swakt: (typeof options === 'object' && options.swakt ? options.swakt : '59a97a5f-0924-3720-a62e-0c44d9ea4f16'
            };
    */

    var thisOptions = Ink.extendObj({
                s:          'js.ink.sapo.pt',
                swakt:      '59a97a5f-0924-3720-a62e-0c44d9ea4f16',
                pg:         false,  // default will be classURL (arguments[0])
                swasection: false, // default will be classURL (arguments[0])
                swasubsection: '',
                dc:         '',
                ref:        false,
                etype:      'inkjs-view',
                swav:       '1',
                swauv:      '1',
                bcs:        '1',
                bsr:        '1',
                bul:        '1',
                bje:        '1',
                bfl:        '1',
                debug:      false
            }, arguments[1] || {});

    if (typeof classURL !== 'undefined' && classURL !== null) {

        if (!thisOptions.pg) {
            thisOptions.pg = classURL;
        }
        if (!thisOptions.swasection) {
            thisOptions.swasection = classURL;
        }
        if (!thisOptions.ref) {
            thisOptions.ref = location.href;
        }

        var waURI = 'http://wa.sl.pt/wa.gif?';
        var waURISSL = 'https://ssl.sapo.pt/wa.sl.pt/wa.gif?';

        var aQuery = [
            'pg=' + encodeURIComponent(thisOptions.pg),
            'swasection=' + encodeURIComponent(thisOptions.swasection),
            'swasubsection=' + encodeURIComponent(thisOptions.swasubsection),
            'dc=' +  encodeURIComponent(thisOptions.dc),
            's=' + thisOptions.s,
            'ref=' + encodeURIComponent(thisOptions.ref),
            'swakt=' + thisOptions.swakt,
            'etype=' + encodeURIComponent(thisOptions.etype),
            'swav=' + encodeURIComponent(thisOptions.swav),
            'swauv=' + encodeURIComponent(thisOptions.swauv),
            'bcs=' + encodeURIComponent(thisOptions.bcs),
            'bsr=' + encodeURIComponent(thisOptions.bsr),
            'bul=' + encodeURIComponent(thisOptions.bul),
            'bje=' + encodeURIComponent(thisOptions.bje),
            'bfl=' + encodeURIComponent(thisOptions.bfl),
            ''
            ];

        var waLogURI = ((location.protocol === 'https:') ? waURISSL : waURI);

        var img = new Image();
        img.src = waLogURI+aQuery.join('&');
    }
};

/* }}} */

/* {{{ Ink.require()
 * param: <object>
 *      object = [
 *          {
 *              uri: 'url to load',  (/relative_ink_path | http://absolute_url)
 *              check: object to check <optional>
 *              version: object version to check <optional>
 *          }
 *      ]
 *  OR
 *      object = [
 *          <SAPO object 1> / <URI 1 string>,
 *          <SAPO object 2> / <URI 2 string>,
 *          <SAPO object 3> > <URI 3 string>
 *      ]
 *  OR
 *      object = [
 *          [<SAPO object 1>, <optional Version>],
 *          [<SAPO object 2>, <optional Version>],
 *          [<SAPO object 3>, <optional Version>]
 *      ]
 * param: <function> callBack
 */


/* {{{ Ink._require(uri, callBack) PRIVATE */
Ink._require = function(uri, callBack)
{
    if(typeof uri !== 'string') {
        return;
    }
    var script = document.createElement('script');
    script.type = 'text/javascript';

    var aHead = document.getElementsByTagName('HEAD');
    if(aHead.length > 0) {
        aHead[0].appendChild(script);
    }

    if(document.addEventListener) {
        script.onload = function(e) {
            if(typeof callBack !== 'undefined') {
                callBack();
            }
        };
    } else {
        script.onreadystatechange = function(e) {
            if(this.readyState === 'loaded') {
                if(typeof callBack !== 'undefined') {
                    callBack();
                }
            }
        };
    }
    script.src = uri;
};
/* }}} */

/**
 * @function ? Loads a list of given modules and executes a callback when the modules are ready
 * @param {Array|String} reqArray - Array of modules (url's, namespaces) to be loaded. If only one module is being loaded, a string can be used
 * @param {Function} callBack - callback to be executed after the modules are loaded
 * @param {Boolean} async - If true, executes the callback immediately, not waiting for the modules to be loaded
 */
Ink.require = function(reqArray, callBack/*, async = false */)
{
    var objectsToCheck = [];
    var uriToAdd = [];

    /* {{{ _isInkObject() */
    // checks if a string is a Ink namespace
    var _isInkObject = function(param) {
        if (typeof param === 'string') {
            if (/^Ink\./.test(param)) {
                return true;
            }
        }
        return false;
    };
    /*}}} */

    /* {{{ _isObjectUri() */
    // checks if a given var is an object and contains an uri
    var _isObjectUri = function(param) {
        if (typeof param === 'object' && param.constructor === Object) {
            if (typeof param.uri === 'string') {
                return true;
            }
        }
        return false;
    };
    /* }}} */

    /* {{{ _isObjectArray() */
    var _isObjectArray = function(param) {
        if (typeof param === 'object' && param.constructor === Array) {
            return true;
        }
        return false;
    };
    /* }}} */

    /* {{{ _parseInkObject() */
     // parses a Ink namespace definition into a url
    var _parseInkObject = function(param) {
        var aInk = param.split('.');
        var sapoURI = aInk.join('/');
        return 'http://js.ink.sapo.pt/'+sapoURI+'/';
    };
    /* }}} */

    /* {{{ _parseObjectUri() */
    var _parseObjectUri = function(param){
        return param.uri;
    };
    /* }}} */

    /* {{{ _objectExists(objStr) */
    var _objectExists = function(objStr, ver) {
        if (typeof objStr !== 'undefined') {
            var aStrObj = objStr.split('.');
            var objParent = window;
            for (var k=0, aStrObjLength = aStrObj.length; k < aStrObjLength; k++) {
                if (typeof objParent[aStrObj[k]] !== 'undefined') {
                    objParent = objParent[aStrObj[k]];
                } else {
                    return false;
                }
            }

            if (typeof ver !== 'undefined' && ver !== null) {
                if (typeof objParent.version !== 'undefined'){
                    if (objParent.version === ver) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
            return true;
        }
    };
    /* }}} */

    /* {{{ requestRecursive() */
    var requestRecursive = function()
    {
        if (uriToAdd.length > 1) {
            Ink._require(uriToAdd[0], requestRecursive);
            uriToAdd.splice(0,1);
        } else if (uriToAdd.length === 1) {
            if (typeof callBack !== 'undefined') {
                Ink._require(uriToAdd[0], callBack);
            } else {
                Ink._require(uriToAdd[0]);
            }
            uriToAdd.splice(0,1);
        } else if (uriToAdd.length === 0){
            if (typeof callBack !== 'undefined') {
                callBack();
            }
        }

    };
    /* }}} */

    if (typeof reqArray !== 'undefined') {
        var cur = false;
        var curURI = false;

        if (typeof reqArray === 'string') {
            if (_isInkObject(reqArray)) {
                if (!_objectExists(reqArray)) {
                    uriToAdd.push(_parseInkObject(reqArray));
                }
            } else {
                uriToAdd.push(reqArray);
            }
        } else {
            for(var i=0, reqArrayLength=reqArray.length; i < reqArrayLength; i++) {
                cur = reqArray[i];
                if(_isInkObject(cur)) {
                    if(!_objectExists(cur)) {
                        objectsToCheck.push(cur);
                        uriToAdd.push(_parseInkObject(cur));
                    }
                } else if(_isObjectArray(cur)) {
                    if(cur.length > 0) {
                        if(_isInkObject(cur[0])) {
                            if(!_objectExists(cur[0])) {
                                if(cur.length === 2) {
                                    uriToAdd.push(_parseInkObject(cur[0])+cur[1]+'/');
                                } else {
                                    uriToAdd.push(_parseInkObject(cur[0]));
                                }
                            }
                        }
                    }
                } else {
                    if (typeof cur === 'string') {
                        uriToAdd.push(cur);
                    } else {
                        if (_isObjectUri(cur)) {
                            if (typeof cur.check === 'string') {
                                if (typeof cur.version === 'string') {
                                    if (!_objectExists(cur.check, cur.version)) {
                                        uriToAdd.push(_parseObjectUri(cur));
                                    }
                                } else {
                                    if(!_objectExists(cur.check)) {
                                        uriToAdd.push(_parseObjectUri(cur));
                                    }
                                }
                            } else {
                                uriToAdd.push(_parseObjectUri(cur));
                            }
                        }
                    }
                }
            }
        }

        if (arguments.length === 3) {
            if (typeof arguments[2] === 'boolean') {
                if (arguments[2] === true) {
                    for(var l=0, uriToAddLength=uriToAdd.length; l < uriToAddLength; l++) {
                        Ink._require(uriToAdd[l]);
                    }
                    if (typeof callBack !== 'undefined') {
                        callBack();
                    }
                    return;
                }
            }
            requestRecursive();
        } else {
            requestRecursive();
        }

    }

};


/* }}} */
