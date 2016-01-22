.PHONY: deploy_facebook_uri

all:

deploy_facebook_uri:
	mkdir -p tmp
	cp src/templates/facebook-uri.html tmp/
	gzip tmp/facebook-uri.html
	mv tmp/facebook-uri.html.gz tmp/facebook-uri.html
	s3cmd put --acl-public --add-header="Cache-Control":"max-age=600" --add-header 'Content-Encoding:gzip' tmp/facebook-uri.html s3://livefyre-cdn/libs/share/
	rm -rf tmp
