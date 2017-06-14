#!/bin/bash
set -ev
npm test
npm run coverage
npm run codecov
if [ "${TRAVIS_PULL_REQUEST}" != "false" ]; then
	npm run lint
fi
