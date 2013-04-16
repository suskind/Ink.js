
help:
	@echo Relevant tasks are:
	@echo "    all               (extractTree min updateSymLinks docs)"
	@echo "    clean             (deleteSymLinks deleteMinFiles removeDirs)"
	@echo "    report"
	@echo "    docs"
	@echo "    showDocs"
	@echo "    min"
	@echo "    extractTree"
	@echo "    updateSymLinks"
	@echo "    deleteSymLinks"



all: extractTree min updateSymLinks docs done


report: deleteSymLinks deleteMinFiles
	@echo "\ngenerating report..."
	@plato -r -l .jshintrc -d report Ink
	@google-chrome report/index.html


clean: deleteSymLinks deleteMinFiles removeDirs done
	@rm -rf ./inkjs.js
	@echo "clean."


.PHONY: docs report deleteSymLinks deleteMinFiles removeDirs done


extractTree:
	@echo "\nextracting tree..."
	@node serverUtils/extractTree.js


extractTestsTree:
	@echo "\nextracting tests tree..."
	@node serverUtils/extractTestsTree.js


deleteTestResults:
	@echo "\ndeleting previous test results..."
	@node serverUtils/deleteTestResults.js


runTests: extractTestsTree deleteTestResults
	@echo "\nrunning tests..."
	@node serverUtils/runTests.js


updateSymLinks:
	@echo "\nupdating sym links..."
	@node serverUtils/manageSymLinks.js update


deleteSymLinks:
	@echo "\ndeleting sym links..."
	@node serverUtils/manageSymLinks.js delete


docs:
	@echo "\ngenerating documentation..."
	@yuidoc -c .yuidoc.json --no-code -T default -q ./Ink


showDocs: docs
	@google-chrome docs/index.html


min:
	@echo "\nminifying code..."
	@node serverUtils/minFiles.js


bundle:
	@echo "\nbundling..."
	@node serverUtils/bundle.js


deleteMinFiles:
	@echo "\nremoving minified files..."
	@node serverUtils/deleteMinFiles.js


removeDirs:
	@echo "\nremoving docs and reports directories..."
	@rm -rf docs
	@rm -rf report


done:
	@echo "\nDONE!"
