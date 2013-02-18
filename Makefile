
help:
	@echo Valid tasks are:
	@echo "    all"
	@echo "    extractTree"
	@echo "    updateSymLinks"
	@echo "    deleteSymLinks"
	@echo "    docs"
	@echo "    minify"
	@echo "    hint"


all: extractTree hint minify updateSymLinks docs done


.PHONY: docs


extractTree:
	@echo "\nextractTree: TODO"
	

updateSymLinks:
	@echo "\nUpdating sym links..."
	@node symLinks.js update


deleteSymLinks:
	@echo "\nDeleting sym links..."
	@node symLinks.js delete


docs:
	@echo "\nGenerating documentation..."
	@yuidoc -c .yuidoc.json --no-code -T default -q ./Ink


minify:
	@echo "\nminify: TODO"


hint:
	@echo "\nhint: TODO"


done:
	@echo "\nDONE!"