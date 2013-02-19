
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


.PHONY: docs report


extractTree:
	@echo "\nExtracting dirs tree..."
	@node serverUtils/extractTree.js
	

updateSymLinks:
	@echo "\nUpdating sym links..."
	@node serverUtils/manageSymLinks.js update


deleteSymLinks:
	@echo "\nDeleting sym links..."
	@node serverUtils/manageSymLinks.js delete


docs:
	@echo "\nGenerating documentation..."
	@yuidoc -c .yuidoc.json --no-code -T default -q ./Ink


min:
	@echo "\nminifying code..."
	@node serverUtils/minFiles.js


deleteMinFiles:
	@echo "\nremoving minified files..."
	@node serverUtils/deleteMinFiles.js


report: deleteSymLinks deleteMinFiles
	@echo "\ngenerating report..."
	@plato -r -d report Ink
	@google-chrome report/index.html


clean: deleteSymLinks deleteMinFiles
	@rm -f docs
	@rm -f report


done:
	@echo "\nDONE!"