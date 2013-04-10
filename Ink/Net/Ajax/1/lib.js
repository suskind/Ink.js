/**
 * @author inkdev AT sapo.pt
 */

/**
 * @constructor Ink.Net.Ajax.?
 *
 * Creates a new cross browser XMLHttpRequest object
 *
 * @param {String} url - request url
 * @param {optional Object} options - request options
 *      @... {Boolean}        asynchronous   - if the request should be asynchronous. true by default.
 *      @... {String}         method         - HTTP request method. POST by default.
 *      @... {Object|String}  parameters     - Request parameters which should be sent with the request
 *      @... {Number}         timeout        - Request timeout
 *      @... {Number}         delay          - Artificial delay. If request is completed in time lower than this, then wait a bit before calling the callbacks
 *      @... {String}         postBody       - POST request body. If not specified, it's filled with the contents from parameters
 *      @... {String}         contentType    - Content-type header to be sent. Defaults to 'application/x-www-form-urlencoded'
 *      @... {Object}         requestHeaders - key-value pairs for additional request headers
 *      @... {Function}       onComplete     - Callback executed after the request is completed, no matter what happens during the request.
 *      @... {Function}       onSuccess      - Callback executed if the request is successful (requests with 2xx status codes)
 *      @... {Function}       onFailure      - Callback executed if the request fails (requests with status codes different from 2xx)
 *      @... {Function}       onException    - Callback executed if an exception  occurs. Receives the exception as a parameter.
 *      @... {Function}       onCreate       - Callback executed after object initialization but before the request is made
 *      @... {Function}       onInit         - Callback executed before any initialization
 *      @... {Function}       onTimeout      - Callback executed if the request times out
 *      @... {Boolean|String} evalJS         - If the request Content-type header is application/json, evaluates the response and populates responseJSON. Use 'force' if you want to force the response evaluation, no matter what Content-type it's using. Defaults to true.
 *      @... {Boolean}        sanitizeJSON   - Sanitize the content of responseText before evaluation
 *      @... {String}         xhrProxy       - URI for proxy service hosted on the same server as the web app, that can fetch documents from other domains.
 *                                             The service must pipe all input and output untouched (some input sanitization is allowed, like clearing cookies).
 *                                             e.g., requesting http://example.org/doc can become /proxy/http%3A%2F%2Fexample.org%2Fdoc The proxy service will
 *                                             be used for cross-domain requests, if set, else a network error is returned as exception.
 */

Ink.createModule('Ink.Net.Ajax', '1', [], function() {

'use strict';

var Ajax = function(url, options){

    // start of AjaxMock patch - uncomment to enable it
    /*var AM = SAPO.Communication.AjaxMock;
    if (AM && !options.inMock) {
        if (AM.autoRecordThisUrl && AM.autoRecordThisUrl(url)) {
            return new AM.Record(url, options);
        }
        if (AM.mockThisUrl && AM.mockThisUrl(url)) {
            return new AM.Play(url, options, true);
        }
    }*/
    // end of AjaxMock patch

    this.init(url, options);
};

/**
* Options for all requests. These can then be
* overriden for individual ones.
*/
Ajax.globalOptions = {
    parameters: {},
    requestHeaders: {}
};


// IE10 does not need XDomainRequest
var xMLHttpRequestWithCredentials = 'XMLHttpRequest' in window && 'withCredentials' in (new XMLHttpRequest());



Ajax.prototype = {

    init: function(url, userOptions) {
        if (!url) {
            throw new Error("WRONG_ARGUMENTS_ERR");
        }
        var options = Ink.extendObj({
            asynchronous: true,
            method: 'POST',
            parameters: null,
            timeout: 0,
            delay: 0,
            postBody: '',
            contentType:  'application/x-www-form-urlencoded',
            requestHeaders: null,
            onComplete: null,
            onSuccess: null,
            onFailure: null,
            onException: null,
            onHeaders: null,
            onCreate: null,
            onInit: null,
            onTimeout: null,
            sanitizeJSON: false,
            evalJS: true,
            xhrProxy: '',
            cors: false,
            debug: false,
            useCredentials: false,
            signRequest: false
        }, Ajax.globalOptions);

        if (userOptions && typeof userOptions === 'object') {
            options = Ink.extendObj(options, userOptions);


            if (typeof userOptions.parameters === 'object') {
                options.parameters = Ink.extendObj(Ink.extendObj({}, Ajax.globalOptions.parameters), userOptions.parameters);
            } else if (userOptions.parameters !== null) {
                var globalParameters = this.paramsObjToStr(Ajax.globalOptions.parameters);
                if (globalParameters) {
                    options.parameters = userOptions.parameters + '&' + globalParameters;
                }
            }

            options.requestHeaders = Ink.extendObj({}, Ajax.globalOptions.requestHeaders);
            options.requestHeaders = Ink.extendObj(options.requestHeaders, userOptions.requestHeaders);
        }

        this.options = options;

        this.safeCall('onInit');

        var urlLocation =  document.createElementNS ?
            document.createElementNS('http://www.w3.org/1999/xhtml', 'a') :
            document.createElement('a');
        urlLocation.href = url;

        this.url = url;
        this.isHTTP = urlLocation.protocol.match(/^https?:$/i) && true;
        this.requestHasBody = options.method.search(/^get|head$/i) < 0;

        if (!this.isHTTP || location.protocol === 'widget:' || typeof window.widget === 'object') {
            this.isCrossDomain = false;
        } else {
            this.isCrossDomain = location.protocol !== urlLocation.protocol || location.host !== urlLocation.host.split(':')[0];
        }
        if(this.options.cors) {
            this.isCrossDomain = false;
        }

        this.transport = this.getTransport();

        this.request();
    },

    /**
     * {Object} Creates the appropriate XMLHttpRequest object
     * @return XMLHttpRequest object
     */
    getTransport: function()
    {
        /*global XDomainRequest:false, ActiveXObject:false */
        if (!xMLHttpRequestWithCredentials && this.options.cors && 'XDomainRequest' in window) {
            this.usingXDomainReq = true;
            return new XDomainRequest();
        }
        else if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        else if (typeof ActiveXObject !== 'undefined') {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        } else {
            return null;
        }
    },

    /**
     * Set the necessary headers for an ajax request
     * @param {String} url - url for the request
     */
    setHeaders: function()
    {
        if (this.transport) {
            try {
                var headers = {
                    "Accept": "text/javascript,text/xml,application/xml,application/xhtml+xml,text/html,application/json;q=0.9,text/plain;q=0.8,video/x-mng,image/png,image/jpeg,image/gif;q=0.2,*/*;q=0.1",
                    "Accept-Language": navigator.language,
                    "X-Requested-With": "XMLHttpRequest",
                    "X-Ink-Version": "1"
                };
                if (this.options.cors) {
                    if (!this.options.signRequest) {
                        delete headers['X-Requested-With'];
                    }
                    delete headers['X-Ink-Version'];
                }

                if (this.options.requestHeaders && typeof this.options.requestHeaders === 'object') {
                    for(var headerReqName in this.options.requestHeaders) {
                        headers[headerReqName] = this.options.requestHeaders[headerReqName];
                    }
                }

                if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005) {
                    headers['Connection'] = 'close';
                }

                for (var headerName in headers) {
                    if(headers.hasOwnProperty(headerName)) {
                        this.transport.setRequestHeader(headerName, headers[headerName]);
                    }
                }
            } catch(e) {}
        }
    },

    /**
     * {String} Converts an object with parameters to a querystring
     * @param {Object|String} optParams - parameters object
     * @return querystring
     */
    paramsObjToStr: function(optParams) {
        var k, m, p, a, params = [];
        if (typeof optParams === 'object') {
            for (p in optParams){
                if (optParams.hasOwnProperty(p)) {
                    a = optParams[p];
                    if (Object.prototype.toString.call(a) === '[object Array]' && !isNaN(a.length)) {
                        for (k = 0, m = a.length; k < m; k++) {
                            params = params.concat([
                                encodeURIComponent(p),    '=',
                                encodeURIComponent(a[k]), '&'
                            ]);
                        }
                    }
                    else {
                        params = params.concat([
                            encodeURIComponent(p), '=',
                            encodeURIComponent(a), '&'
                        ]);
                    }
                }
            }
            if (params.length > 0) {
                params.pop();
            }
        }
        else
        {
            return optParams;
        }
        return params.join('');
    },

    /**
     * set the url parameters for a GET request
     */
    setParams: function()
    {
        var params = null, optParams = this.options.parameters;

        if(typeof optParams === "object"){
            params = this.paramsObjToStr(optParams);
        } else {
            params = '' + optParams;
        }

        if(params){
            if(this.url.indexOf('?') > -1) {
                this.url = this.url.split('#')[0] + '&' + params;
            } else {
                this.url = this.url.split('#')[0] + '?' + params;
            }
        }
    },

    /**
     * {String} Retrieves HTTP header from response
     * @param {String} name - header name
     * @return header content
     */
    getHeader: function(name)
    {
        if (this.usingXDomainReq && name === 'Content-Type') {
            return this.transport.contentType;
        }
        try{
            return this.transport.getResponseHeader(name);
        } catch(e) {
            return null;
        }
    },

    /**
     * {String} Returns all http headers from the response
     * @return the headers, each separated by a newline
     */
    getAllHeaders: function()
    {
        try {
            return this.transport.getAllResponseHeaders();
        } catch(e) {
            return null;
        }
    },

    /**
     * {Object} Setup the response object
     * @return the response object
     */
    getResponse: function(){
        // setup our own stuff
        var t = this.transport,
            r = {
                headerJSON: null,
                responseJSON: null,
                getHeader: this.getHeader,
                getAllHeaders: this.getAllHeaders,
                request: this,
                transport: t,
                timeTaken: new Date() - this.startTime,
                requestedUrl: this.url
            };

        // setup things expected from the native object
        r.readyState = t.readyState;
        try { r.responseText = t.responseText; } catch(e) {}
        try { r.responseXML  = t.responseXML;  } catch(e) {}
        try { r.status       = t.status;       } catch(e) { r.status     = 0;  }
        try { r.statusText   = t.statusText;   } catch(e) { r.statusText = ''; }

        return r;
    },

    /**
     * Aborts the request if still running. No callbacks are called.
     * @return the response object
     */
    abort: function(){
        if (this.transport) {
            clearTimeout(this.delayTimeout);
            clearTimeout(this.stoTimeout);
            try { this.transport.abort(); } catch(ex) {}
            this.finish();
        }
    },

    /**
     * Executes the state changing phase of an ajax request
     */
    runStateChange: function()
    {
        var rs = this.transport.readyState;
        if (rs === 3) {
            if (this.isHTTP) {
                this.safeCall('onHeaders');
            }
        } else if (rs === 4 || this.usingXDomainReq) {

            if (this.options.asynchronous && this.options.delay && (this.startTime + this.options.delay > new Date().getTime())) {
                this.delayTimeout = setTimeout(Ink.bind(this.runStateChange, this), this.options.delay + this.startTime - new Date().getTime());
                return;
            }

            var responseJSON,
                responseContent = this.transport.responseText,
                response = this.getResponse(),
                curStatus = this.transport.status;

            if (this.isHTTP && !this.options.asynchronous) {
                this.safeCall('onHeaders');
            }

            clearTimeout(this.stoTimeout);

            if (curStatus === 0) {
                // Status 0 indicates network error for http requests.
                // For http less requests, 0 is always returned.
                if (this.isHTTP) {
                    this.safeCall('onException', this.makeError(18, 'NETWORK_ERR'));
                } else {
                    curStatus = responseContent ? 200 : 404;
                }
            }
            else if (curStatus === 304) {
                curStatus = 200;
            }
            var isSuccess = this.usingXDomainReq || 200 <= curStatus && curStatus < 300;

            var headerContentType = this.getHeader('Content-Type') || '';
            if (this.options.evalJS &&
                (headerContentType.indexOf("application/json") >= 0 || this.options.evalJS === 'force')){
                    try {
                        responseJSON = this.evalJSON(responseContent, this.sanitizeJSON);
                        if(responseJSON){
                            responseContent = response.responseJSON = responseJSON;
                        }
                    } catch(e){
                        if (isSuccess) {
                            // If the request failed, then this is perhaps an error page
                            // so don't notify error.
                            this.safeCall('onException', e);
                        }
                    }
            }

            if (this.usingXDomainReq && headerContentType.indexOf('xml') !== -1 && 'DOMParser' in window) {
                // http://msdn.microsoft.com/en-us/library/ie/ff975278(v=vs.85).aspx
                var mimeType;
                switch (headerContentType) {
                    case 'application/xml':
                    case 'application/xhtml+xml':
                    case 'image/svg+xml':
                        mimeType = headerContentType;
                        break;
                    default:
                        mimeType = 'text/xml';
                }
                var xmlDoc = (new DOMParser()).parseFromString( this.transport.responseText, mimeType);
                this.transport.responseXML = xmlDoc;
                response.responseXML  = xmlDoc;
            }

            if (this.transport.responseXML !== null && response.responseJSON === null && this.transport.responseXML.xml !== ""){
                responseContent = this.transport.responseXML;
            }

            if (curStatus || this.usingXDomainReq) {
                if (isSuccess) {
                    this.safeCall('onSuccess', response, responseContent);
                } else {
                    this.safeCall('onFailure', response, responseContent);
                }
                this.safeCall('on'+curStatus, response, responseContent);
            }
            this.finish(response, responseContent);
        }
    },

    /**
     * @function ? Last step after XHR is complete. Call onComplete and
     *             cleanup object.
     */
    finish: function(response, responseContent){
        if (response) {
            this.safeCall('onComplete', response, responseContent);
        }
        clearTimeout(this.stoTimeout);

        if (this.transport) {
            // IE6 sometimes barfs on this one
            try{ this.transport.onreadystatechange = null; } catch(e){}

            if (typeof this.transport.destroy === 'function') {
                // Stuff for Samsung.
                this.transport.destroy();
            }

            // Let XHR be collected.
            this.transport = null;
        }
    },

    /**
     * @function ? Safely calls a callback function. Verifies that
     *             the callback is well defined and traps errors
     */
    safeCall: function(listener, first/*, second*/) {
        function rethrow(exception){
            setTimeout(function() {
                // Rethrow exception so it'll land in
                // the error console, firebug, whatever.
                if (exception.message) {
                    exception.message += '\n'+(exception.stacktrace || exception.stack || '');
                }
                throw exception;
            }, 1);
        }
        if (typeof this.options[listener] === 'function') {
            //SAPO.safeCall(this, this.options[listener], first, second);
            //return object[listener].apply(object, [].slice.call(arguments, 2));
            try {
                this.options[listener].apply(this, [].slice.call(arguments, 1));
            } catch(ex) {
                rethrow(ex);
            }
        } else if (first && window.Error && (first instanceof Error)) {
            rethrow(first);
        }
    },

    /**
     * @function ? Sets new request header for the subsequent http request
     */
    setRequestHeader: function(name, value){
        if (!this.options.requestHeaders) {
            this.options.requestHeaders = {};
        }
        this.options.requestHeaders[name] = value;
    },

    /**
     * Execute the request
     * @param {String} url - request url
     */
    request: function()
    {
        if(this.transport) {
            var params = null;
            if(this.requestHasBody) {
                if(this.options.postBody !== null && this.options.postBody !== '') {
                    params = this.options.postBody;
                    this.setParams();
                } else if (this.options.parameters !== null && this.options.parameters !== ''){
                    params = this.options.parameters;
                }

                if (typeof params === "object" && !params.nodeType) {
                    params = this.paramsObjToStr(params);
                } else if (typeof params !== "object" && params !== null){
                    params = '' + params;
                }

                if(this.options.contentType) {
                    this.setRequestHeader('Content-Type', this.options.contentType);
                }
            } else {
                this.setParams();
            }

            var url = this.url;
            var method = this.options.method;
            var crossDomain = this.isCrossDomain;

            if (crossDomain && this.options.xhrProxy) {
                this.setRequestHeader('X-Url', url);
                url = this.options.xhrProxy + encodeURIComponent(url);
                crossDomain = false;
            }

            try {
                this.transport.open(method, url, this.options.asynchronous);
            } catch(e) {
                this.safeCall('onException', e);
                return this.finish(this.getResponse(), null);
            }

            this.setHeaders();

            this.safeCall('onCreate');

            if(this.options.timeout && !isNaN(this.options.timeout)) {
                this.stoTimeout = setTimeout(Ink.bind(function() {
                    if(this.options.onTimeout) {
                        this.safeCall('onTimeout');
                        this.abort();
                    }
                }, this), (this.options.timeout * 1000));
            }

            if(this.options.useCredentials && !this.usingXDomainReq) {
                this.transport.withCredentials = true;
            }

            if(this.options.asynchronous && !this.usingXDomainReq) {
                this.transport.onreadystatechange = Ink.bind(this.runStateChange, this);
            }
            else if (this.usingXDomainReq) {
                this.transport.onload = Ink.bind(this.runStateChange, this);
            }

            try {
                if (crossDomain) {
                    // Need explicit handling because Mozila aborts
                    // the script and Chrome fails silently.per the spec
                    throw this.makeError(18, 'NETWORK_ERR');
                } else {
                    this.startTime = new Date().getTime();
                    this.transport.send(params);
                }
            } catch(e) {
                this.safeCall('onException', e);
                return this.finish(this.getResponse(), null);
            }

            if(!this.options.asynchronous) {
                this.runStateChange();
            }
        }
    },

    /**
     * @function {Object} ? Returns new exception object
     *                      that can be thrown
     */
    makeError: function(code, message){
        if (typeof Error !== 'function') {
            return {code: code, message: message};
        }
        var e = new Error(message);
        e.code = code;
        return e;
    },

    /**
     * @function {Boolean} ? Checks if a given string is valid json
     * @param {String} str - String to be evaluated
     * @return True if the string is valid json
     */
    isJSON: function(str)
    {
        if (typeof str !== "string" || !str){ return false; }
        str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
        return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
    },

    /**
     * @function {Object} ? Evaluates a given string as json
     * @param {String} str - String to be evaluated
     * @param {Boolean} sanitize - whether to sanitize the content or not
     * @return Json content as an object
     */
    evalJSON: function(strJSON, sanitize)
    {
        if (strJSON && (!sanitize || this.isJSON(strJSON))) {
            try {
                if (typeof JSON  !== "undefined" && typeof JSON.parse !== 'undefined'){
                    return JSON.parse(strJSON);
                }
                return eval('(' + strJSON + ')');
            } catch(e) {
                throw new Error('ERROR: Bad JSON string...');
            }
        }
        return null;
    }
};

/**
 * @function {Object} ? Loads content from a given url through a XMLHttpRequest. Shortcut function for simple AJAX use cases.
 * @param {String} url - request url
 * @param {Function} callback - callback to be executed if the request is successful
 * @return XMLHttpRequest object
 */
Ajax.load = function(url, callback){
    return new Ajax(url, {
        method: 'GET',
        onSuccess: function(response){
            callback(response.responseText, response);
        }
    });
};

/**
 * @function {Object} ? Loads content from a given url through a XMLHttpRequest. Shortcut function for simple AJAX use cases.
 * @param {String} url - request url
 * @param {Function} callback - callback to be executed if the request is successful
 * @return XMLHttpRequest object
 */
Ajax.ping = function(url, callback){
    return new Ajax(url, {
        method: 'HEAD',
        onSuccess: function(response){
            if (typeof callback === 'function'){
                callback(response);
            }
        }
    });
};


return Ajax;

});

