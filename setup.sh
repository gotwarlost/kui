#!/bin/bash

set -ev
rm -rf dist/
npm install
(cd app && npm install)
npm run build

