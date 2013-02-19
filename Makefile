
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


showDocs: docs
	@google-chrome docs/index.html


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