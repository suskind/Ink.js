
all: updateSymLinks docs


.PHONY: docs


updateSymLinks:
	@node symLinks.js update


deleteSymLinks:
	@node symLinks.js delete


docs:
	@yuidoc -c .yuidoc.json --no-code -T default -q ./Ink
