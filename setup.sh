#!/bin/bash

set -ev
rm -rf dist/
(cd shared && npm install)
npm install
(cd app && npm install)
npm run build

