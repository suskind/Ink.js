# Ink.js - JavaScript Framework by SAPO


## Lib stuff

### Implemented:

* core.js defines Ink if not defined

* offers:

    * Ink.namespace(namespace, returnParentInstead)
    * Ink.loadScript(uriOrModuleName)
    * Ink.createModule(mod, deps, modFn)
    * Ink.requireModules(deps, cbFn)


### TODO:

 * migrate bindObj as bind?
 * migrate bindOjbEvent as bindEvent?
 * migrate require?


---


## Server Tasks

### Implemented:

* symLinks.js updates/deletes lib.js files outside of each module's versions dirs pointing to highest version


### TODO:

* jshint code
* minify code
