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

deploy_facebook_uri:
	mkdir -p tmp
	cp src/templates/facebook-uri.html tmp/
	gzip tmp/facebook-uri.html
	mv tmp/facebook-uri.html.gz tmp/facebook-uri.html
	s3cmd put --acl-public --add-header="Cache-Control":"max-age=600" --add-header 'Content-Encoding:gzip' tmp/facebook-uri.html s3://livefyre-cdn/libs/share/
	rm -rf tmp
