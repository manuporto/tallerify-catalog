#!/bin/bash
set -ev
npm test
if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
	npm run lint
	npm run coverage
	npm run codecov
fi