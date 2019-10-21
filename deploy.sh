#!/bin/bash

source ~/.zshrc

echo "store current Node version"
CURRENT_NODE="$(nvm current)"
echo "${CURRENT_NODE}"

echo "switch Node version to v11"
nvm use 11

echo "set git environment"
git remote rm origin
git remote add origin https://suxxes:${GITHUB_TOKEN}@github.com/suxxes/abroadunderhood.git
git checkout master

echo "run update"
npm run update

echo "save dump"
git add --all dump
git commit -m $'save dump\n\n[ci skip]'
git push origin master &>/dev/null

echo "build'n'deploy"
npm run deploy

echo "switch Node version to ${CURRENT_NODE}"
echo "$(nvm ${CURRENT_NODE})"
