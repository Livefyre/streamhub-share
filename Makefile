.PHONY: clean run test

build: node_modules lib

clean:
	rm -rf dist lib node_modules

compile:
	./node_modules/requirejs/bin/r.js -o ./tools/build.conf.js
	./node_modules/less/bin/lessc -ru --compress src/css/share.{less,css}
	mkdir -p dist
	cp src/css/share.css dist/streamhub-share.min.css

lib: bower.json
	./node_modules/.bin/bower install
	touch $@

node_modules: package.json
	npm install
	touch $@

run:
	./node_modules/http-server/bin/http-server .

test:
	./node_modules/karma/bin/karma start tools/karma.conf.js --singleRun
