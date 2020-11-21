# jest-simplified-reporter

## Requirements
```js
//jest.config.js
coverageProvider: "v8"
``` 
your test command must also collect coverage.

## Install
```
npm i --save-dev jest-simplified-reporter 
```
```js
//jest.config.js
reporters: [['jest-simplified-reporter', {path: './path/where/you/want/stored/fileName.json'}]]

//or

//default path is ./jest-simplified-reporter/results.json
reporters: ['jest-simplified-reporter']
```

## Example
```
git clone https://github.com/zedgell/jest-simplified-reporter.git
cd jest-simplified-reporter
npm i
npm run test
```