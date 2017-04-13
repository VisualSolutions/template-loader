"//registry.npmjs.org/:_authToken=`$`{NPM_TOKEN`}" | Out-File (Join-Path $ENV:APPVEYOR_BUILD_FOLDER ".npmrc") -Encoding UTF8
npm publish