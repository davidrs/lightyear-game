OPEN_APP ?= Google Chrome

.PHONY: open serve help

help:
	@printf "make open  - open the game directly in your browser\n"
	@printf "make serve - serve the folder at http://localhost:8000\n"

open:
	open -a "$(OPEN_APP)" index.html || open index.html

serve:
	python3 -m http.server 8000
