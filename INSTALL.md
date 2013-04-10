# Ink.js - How To



## Requirements

* makefile
* node.js    http://nodejs.org/
* java (jenkins ci)



## Install

    [sudo] npm -g install yuidocjs
    [sudo] npm -g install plato
    npm install uglify-js



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