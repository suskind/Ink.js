# Ink.js 

[Ink](http://ink.sapo.pt/) comes with a collection of [UI components](http://ink.sapo.pt/js/ui/) out of the box. 
These components depend on [Ink's JavaScript core](http://ink.sapo.pt/js/core/), which provides a set of methods and modules that give developers the ability to extend the features of the framework.

Documentation for Ink's JavaScript core comes in two flavours, a simpler version to get you up and running as quickly as possible, and a more technical in depth version for when you want to go beyond our examples, these can be found at http://ink.sapo.pt/js/core/ and http://js.ink.sapo.pt/docs/ respectively.
 
This repo provides you with information on how Ink's JavaScript core is organised.
 
It all starts with __Ink__, from there you will find our main module, __the core__, and all of the relevant namespaces.

## Organization

* Ink/ - It's where you can find all the source code 

## Ink Namespaces 
 * Dom - provides modules to work with DOM and Events 
 * Net - provides communication modules to make AJAX requests or JsonP
 * Util - provides utility modules 
 * UI - Where all [UI modules](http://ink.sapo.pt/js/ui) are made 

A global variable named __Ink__ provides the methods to create and load all of the modules. 
 
Namespaces and modules mirror the structure of the filesystem keeping everything coordinated and where you'd expect it to be.
 
The __lib.js__ file is in a numbered directory to prevent collisions, this way different versions of the same module in the same page will not break any existing code, the following sections show how to avoid collisions altogether.

Ex: 
* /Ink/1/ exposes `window.Ink` 
* /Ink/Dom/Element/1/ exposes `Ink.Dom.Element` and `Ink.Dom.Element_1` with methods to manipulate DOM 
* /Ink/Dom/Event/1/ exposes `Ink.Dom.Event` and `Ink.Dom.Event_1` with methods to manipulate Events
* /Ink/Net/Ajax/1/ exposes `Ink.Net.Ajax` and `Ink.Net.Ajax_1` to make AJAX requests 

## Using modules 
 
There may be times when you need to use an older version of a component in the same instance that a newer one has been loaded. Ink provides a couple of methods that mitigate problems involving namespace collisions when loading modules, namely:
`Ink.requireModule()` - request a module if it's not loaded yet
`Ink.getModule()` - return a module that has already been loaded

Ex: 
```javascript
Ink.requireModules(['Ink.Namespace.ModuleName_version'], function(ModuleName) {
    ModuleName.moduleMethod('arg1', 'arg2');
});
```

or 

```javascript
var ModuleName = Ink.getModule('Ink.Namespace.ModuleName', version);
ModuleName.moduleMethod('arg1', 'arg2');
```


## Creating modules 
Take a look at our samples on __/Ink/Namespace/ClassModule/__ and __/Ink/Namespace/StaticModule/__
In a simple explanation its: 
```javascript
Ink.createModule(
    'Ink.Namespace.ModuleName', 
    'version', 
    ['Ink_Namespace_Dependency1_version', 'Ink_Namespace_Dependency2_version'], 
    function(Dependency1, Dependency2) {
        var ModuleName = {
            // __...your code hete...__
        };

        return ModuleName;
    }
);
```



## Other important files on the repo: 
* Makefile - Running "make all" will minify all modules, create bundles (in builds directory) and documentation files (in docs directory) 
* builds - It's the place where bundles are created (ink-v.v.v.js, ink-all.v.v.v.js and ink-ui.v.v.v.js) 
* serverUtils - The place with node.js scripts and config files to run make 


# Install Ink.js on your machine - How To

## Requirements

* makefile
* node.js    http://nodejs.org/
* java (jenkins ci)



## Install

    [sudo] npm -g install yuidocjs
    [sudo] npm -g install plato
    npm install uglify-js
    npm install async



## Local Selenium Grid - how to

1. Download standalone server:

http://docs.seleniumhq.org/download/ 

Selenium Server (formerly the Selenium RC Server) - http://selenium.googlecode.com/files/selenium-server-standalone-2.31.0.jar



2. Download relevant drivers:

https://code.google.com/p/chromedriver/downloads/list

ChromeDriver server for linux64 - https://code.google.com/p/chromedriver/downloads/detail?name=chromedriver_linux64_26.0.1383.0.zip&can=2&q=



3. prepare bash scripts:

hub.sh

    #!/bin/bash
    java -jar selenium-server-standalone-2.31.0.jar -role hub


node.sh

    #!/bin/bash
    java -jar selenium-server-standalone-2.31.0.jar -role node -hub http://localhost:4444/grid/register

chmod a+x *.sh

run hub and node in two consoles and you're done



## Local Jenkins CI - how to

1. download it

http://jenkins-ci.org/

http://mirrors.jenkins-ci.org/war/latest/jenkins.war



2. run it

java -jar jenkins.war

jenkins persists stuff to ~/.jenkins, so it's easy to remove build runs and migrate configurations to other machines



3. example project

~/.jenkins/jobs/InkJS

config.xml

	<?xml version='1.0' encoding='UTF-8'?>
	<project>
	  <actions/>
	  <description></description>
	  <keepDependencies>false</keepDependencies>
	  <properties/>
	  <scm class="hudson.scm.NullSCM"/>
	  <canRoam>true</canRoam>
	  <disabled>false</disabled>
	  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
	  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
	  <triggers class="vector"/>
	  <concurrentBuild>false</concurrentBuild>
	  <customWorkspace>/home/jdias/Work/inkjs</customWorkspace>
	  <builders>
	    <hudson.tasks.Shell>
	      <command>#!/bin/bash
	#cd /home/jdias/Work/inkjs
	node serverUtils/deleteTestResults.js
	node serverUtils/runTests.js
	</command>
	    </hudson.tasks.Shell>
	  </builders>
	  <publishers>
	    <hudson.tasks.junit.JUnitResultArchiver>
	      <testResults>**/*.xml</testResults>
	      <keepLongStdio>true</keepLongStdio>
	      <testDataPublishers/>
	    </hudson.tasks.junit.JUnitResultArchiver>
	  </publishers>
	  <buildWrappers/>
	</project>

open your browser in: http://127.0.0.1:8080/job/InkJS/
