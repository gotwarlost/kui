build: install compile test lint

be: install-be compile-be test-be lint-be

fe: install-fe compile-fe test-fe lint-fe

clean: clean-be clean-fe

install: install-be install-fe

compile: compile-be compile-fe

test: test-be test-fe

lint: lint-be lint-fe

clean-be:
	rm -rf vendor
	go clean ./...

install-be:
	dep ensure

compile-be:
	go install ./...

test-be:
	go list ./... | grep -v -e vendor | CGO_ENABLED=1 xargs go test -v -race

lint-be:
	go list ./... | grep -v -e vendor | xargs go vet
	go list ./... | grep -v -e vendor | xargs golint

clean-fe:
	rm -rf dist/
	(cd app && rm -rf node_modules/)

install-fe:
	(cd app && npm install)

compile-fe:
	(cd app && npm run build)

lint-fe:
	(cd app && npm run lint)

test-fe:
	(cd app && npm test)

watch:
	(cd app && npm run watch)

dist: clean build
	rm -rf tmp/release
	mkdir -p tmp/release
	go build -o tmp/release/kui .
	rsync -rvtl ./dist ./tmp/release/dist/
	(cd tmp/release && tar -cvzf ../kui.tar.gz .)
