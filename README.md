# Ink.js - JavaScript FrameWork by SAPO



## Done

* core.js defines Ink if not defined

* offers:

    * Ink.namespace(namespace, returnParentInstead)
    * Ink.loadScript(uriOrModuleName)
    * Ink.createModule(mod, deps, modFn)
    * Ink.requireModules(deps, cbFn)

* createLatestSymbolicLinks updates/creates lib.js files outside of each module's versions dirs pointing to highest version



## TODO

* archive highest version outside of versions on `Ink.createModule()`

* support not passing version number on deps when using `Ink.requireModules()`
