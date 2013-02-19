
help:
	@echo Relevant tasks are:
	@echo "    all"
	@echo "    extractTree"
	@echo "    updateSymLinks"
	@echo "    deleteSymLinks"
	@echo "    docs"
	@echo "    min"
	@echo "    report"
	@echo "    clean"


all: extractTree min updateSymLinks docs done


report: deleteSymLinks deleteMinFiles
	@echo "\ngenerating report..."
	@plato -r -d report Ink
	@google-chrome report/index.html


clean: deleteSymLinks deleteMinFiles removeDirs done


.PHONY: docs report


extractTree:
	@echo "\nextracting tree..."
	@node serverUtils/extractTree.js
	

updateSymLinks:
	@echo "\nupdating sym links..."
	@node serverUtils/manageSymLinks.js update


deleteSymLinks:
	@echo "\ndeleting sym links..."
	@node serverUtils/manageSymLinks.js delete


docs:
	@echo "\ngenerating documentation..."
	@yuidoc -c .yuidoc.json --no-code -T default -q ./Ink


min:
	@echo "\nminifying code..."
	@node serverUtils/minFiles.js


deleteMinFiles:
	@echo "\nremoving minified files..."
	@node serverUtils/deleteMinFiles.js


removeDirs:
	@echo "\nremoving docs and reports directories..."
	@rm -rf docs
	@rm -rf report


done:
	@echo "\nDONE!"