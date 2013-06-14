Ink.createModule('Ink.Util.Kink','1',['Ink.Dom.Selector_1', 'Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1', 'Ink.Dom.Loaded_1', 'Ink.Dom.Browser_1', 'Ink.Net.Ajax_1', 'Ink.Net.JsonP_1', 'Ink.Util.Array_1', 'Ink.Util.Date_1', 'Ink.Util.Date_1', 'Ink.Util.String_1', 'Ink.Util.Url_1', 'Ink.Util.Cookie_1'],
    function( Selector, Event, Css, Element, Loaded, Browser, Ajax, JsonP, InkArray, InkDate, InkString, InkUrl, InkCookie ){

        //query selector result class
        var Result = function(resultArray){
            this.arr = resultArray;


            this.get = function(i) {
                if(i===undefined){ i = 0; }

                return new Result([this.arr[i]]);
            };

            this.result = function(i) {
                if(i===undefined){
                    return this.arr;
                }else{
                    return this.arr[i];
                }
            };

            return this;
        };

        //Array
        Result.prototype.each = function(iterator) {
            InkArray.each(this.arr,iterator);
            return this;
        };


        //Css
        Result.prototype.addClassName = Result.prototype.addClass = function(className){
            this.each(function(elem){
                Css.addClassName(elem,className);
            });

            return this;
        };

        Result.prototype.removeClassName = Result.prototype.removeClass = function(className){
            this.each(function(elem){
                Css.removeClassName(elem,className);
            });

            return this;
        };

        Result.prototype.setClassName = Result.prototype.setClass = function(className,boolState){
            this.each(function(elem){
                Css.setClassName(elem,className,boolState);
            });

            return this;
        };

        Result.prototype.hasClassName = Result.prototype.hasClass = function(className){
            return this.some(function(elem){
                return Css.hasClassName(elem,className);
            });
        };

        Result.prototype.hide = function(){
             this.each(function(elem){
                Css.hide(elem);
            });
            return this;
        };

        Result.prototype.show = function(){
            this.each(function(elem){
                Css.show(elem);
            });
            return this;
        };

        Result.prototype.showHide = function(boolState){
            this.each(function(elem){
                Css.showHide(elem,boolState);
            });
            return this;
        };

        Result.prototype.toggle = function(boolState){
            this.each(function(elem){
                Css.toggle(elem,boolState);
            });
            return this;
        };

        Result.prototype.style = Result.prototype.setStyle = function(inlineStyle){
            this.each(function(elem){
                Css.setStyle(elem,inlineStyle);
            });
            return this;
        };

        //Event
        Result.prototype.bind = function(ev,calable){
            if(calable===null){
                //call
                this.each(function(elem){
                    Event.fire(elem,ev);
                });
            }else{
                //bind
                this.each(function(elem){
                    Event.observe(elem,ev,calable);
                });
            }

            return this;
        };

        Result.prototype.click = function(calable){
            return this.bind('click',calable);
        };

        Result.prototype.dblclick = function(calable){
            return this.bind('dblclick',calable);
        };

        Result.prototype.mousemove = function(calable){
            return this.bind('mousemove',calable);
        };

        Result.prototype.mouseover = function(calable){
            this.bind('mouseover',calable);
            return this;
        };
        Result.prototype.mouseout = function(calable){
            this.bind('mouseout',calable);
            return this;
        };

        Result.prototype.hover = function(calableIn,calableOut){
            if(calableOut===undefined){
                this.mouseover(calableIn);
            }else{
                this.mouseover(calableIn).mouseout(calableOut);
            }

            return this;
        };



        //Element
        Result.prototype.html = function(html){
            if(html===null && this.arr.length===1){
                return Element.textContent(this.result(0));
            }

            this.each(function(elem){
                Element.setTextContent(elem,html);
            });

            return this;
        };

        Result.prototype.appendHTML = function(html){

            this.each(function(elem){
                Element.appendHTML(elem,html);
            });

            return this;
        };

        Result.prototype.prependHTML = function(html){

            this.each(function(elem){
                Element.prependHTML(elem,html);
            });

            return this;
        };

        Result.prototype.remove = function(){
            this.each(function(elem){
                Element.remove(elem);
            });
            return true;
        };

        Result.prototype.data = function(){
            return Element.data(this.result(0));
        };

        Result.prototype.size = Result.prototype.elementDimensions = function(){
            return Element.elementDimensions(this.result(0));
        };

        Result.prototype.height = Result.prototype.elementHeight = function(){
            return Element.elementHeight(this.result(0));
        };

        Result.prototype.width = Result.prototype.elementWidth = function(){
            return Element.elementWidth(this.result(0));
        };

        Result.prototype.hasAttribute = function(attr){
            return this.some(function(elem){
                return Element.hasAttribute(elem,attr);
            });
        };

        Result.prototype.scroll = function(){
            return Element.scroll(this.result(0));
        };

        Result.prototype.scrollTo = function(){
            return Element.scrollTo(this.result(0));
        };

        Result.prototype.siblings = function(){
            return new Result(Element.siblings(this.result(0)));
        };

        Result.prototype.parent = function(){
            return new Result([this.result(0).parentNode]);
        };

        Result.prototype.childs = function(i){

            var fetchedChilds = [];

            this.each(function(elem){
                var collection = InkArray.convert(elem.children);
                var childs = new Result(collection);
                childs.each(function(childElem){
                    fetchedChilds.push(childElem);
                });
            });

            if(i===undefined){
                return new Result(fetchedChilds);
            }else{
                return new Result(fetchedChilds).get(i);
            }
        };

        Result.prototype.find = function(param){
            var foundElements = [];

            this.each(function(elem){
                var elements = new Result(Selector.select(param,elem));
                elements.each(function(childElem){
                    foundElements.push(childElem);
                });
            });

            return new Result(foundElements);
        };

        var kink = function(param,context){
            if(typeof param === 'string'){
                return new Result(Selector.select(param,context));
            }else if(param instanceof Array){
                return new Result(param);
            }else{
                return new Result([param]);
            }
        };


        kink.viewportHeight = Element.viewportHeight;
        kink.viewportWidth  = Element.viewportWidth;

        kink.ready    = function(callable){Loaded.run(callable);};
        kink.browser  = Browser;
        kink.url      = InkUrl;
        kink.date     = InkDate;
        kink.string   = InkString;
        kink.cookie   = InkCookie;

        // AJAX
        kink.ajax = function(url,options,onComplete){
            if(typeof options==='function'){
                onComplete = options;
                options = {};
            }else if(options===undefined){
                options = {};
            }

            if(onComplete!==undefined){
                options.onComplete = onComplete;
            }

            return new Ajax(url,options);
        };

        // JsonP
        kink.JsonP = function(url,options,onComplete){
            if(typeof options==='function'){
                onComplete = options;
                options = {};
            }else if(options===undefined){
                options = {};
            }

            if(onComplete!==undefined){
                options.onComplete = onComplete;
            }

            return new JsonP(url,options);
        };


        window.k = kink; // Change this later to a final DOM variable/alias.
        return kink;
    }
);