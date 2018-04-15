#!/bin/bash

set -ev
rm -rf dist/
npm run build
cp package.json dist/
cd dist
npm install --production
electron-packager --no-prune --icon ./app/icons/k8s.png .

