const fs = require("fs");
const path = require("path");
const stripAnsi = require('strip-ansi')
class simplifiedJestReporter{
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }
    async onRunComplete(context, results) {
        const json = {testCoverage: []}
        const functionCoverage = []
        const statementCoverage = []
        const branchCoverage = []
        let unCoveredLines = []
        let totalFunctions = 0
        let functions = 0
        let totalBranches = 0
        let branches = 0
        let totalStatements = 0
        let statements = 0
        let failedTotalFunctions = 0
        let failedFunctions = 0
        let failedTotalBranches = 0
        let failedBranches = 0
        let failedTotalStatements = 0
        let failedStatements = 0
        let failedTest = []
        let numberOfFailedTest = 0
        let numberOfPassedTest = 0
        let numberOfSkippedTest = 0
        results.testResults.forEach(testResults => {
            testResults.v8Coverage.forEach(test => {
                const path = test.result.url.split('/');
                const root = process.cwd().split('/')
                const indexOfRoot = root.length - 1
                let newPathArray = []
                let isInRoot = false
                path.forEach(string => {
                    if(isInRoot){
                        newPathArray.push(string)
                    }
                    if(isInRoot === false && string === root[indexOfRoot]){
                        isInRoot = true
                    }
                })
                let newPath = newPathArray.join('/')
                testResults.testResults.forEach(innerTestResults => {
                    if(innerTestResults.status === 'failed'){
                        numberOfFailedTest += 1
                        let errors = []
                        innerTestResults.failureDetails.forEach(error => {
                            errors.push(error.error)
                        })
                        let newFailedMessages = []
                        innerTestResults.failureMessages.forEach(message => {
                            newFailedMessages.push(stripAnsi(message))
                        })
                        failedTest.push({
                            fileName: newPath,
                            title: innerTestResults.title,
                            ancestorTitles: innerTestResults.ancestorTitles,
                            errors: errors,
                            failureMessages: newFailedMessages
                        })
                    } else if(innerTestResults.status === 'passed'){
                        numberOfPassedTest += 1
                    } else {
                        numberOfSkippedTest += 1
                    }
                })
                for(let fn in results.coverageMap.data[test.result.url].data.fnMap){
                    totalFunctions += 1
                    functions += 1
                    if(results.coverageMap.data[test.result.url].data.f[fn] < 1){
                        failedTotalFunctions += 1
                        failedFunctions += 1
                    }
                    functionCoverage.push({
                        name: results.coverageMap.data[test.result.url].data.fnMap[fn].name,
                        decl: results.coverageMap.data[test.result.url].data.fnMap[fn].decl,
                        loc:  results.coverageMap.data[test.result.url].data.fnMap[fn].loc,
                        isCovered: (results.coverageMap.data[test.result.url].data.f[fn] > 0),
                        timesRan: results.coverageMap.data[test.result.url].data.f[fn]
                    })
                }
                for(let statement in results.coverageMap.data[test.result.url].data.statementMap){
                    statements += 1
                    totalStatements += 1
                    if(results.coverageMap.data[test.result.url].data.s[statement] < 1){
                        unCoveredLines.push(Number(statement) + 1)
                        failedStatements += 1
                        failedTotalStatements += 1
                    }
                    statementCoverage.push({
                        lineNumber: Number(statement) + 1,
                        start: results.coverageMap.data[test.result.url].data.statementMap[statement].start,
                        end: results.coverageMap.data[test.result.url].data.statementMap[statement].start,
                        isCovered: (results.coverageMap.data[test.result.url].data.s[statement] > 0),
                        timesRan: results.coverageMap.data[test.result.url].data.s[statement]
                    })
                }
                for(let branch in results.coverageMap.data[test.result.url].data.branchMap){
                    branches += 1
                    totalBranches += 1
                    if (results.coverageMap.data[test.result.url].data.b[branch][0] < 1) {
                        failedBranches += 1
                        failedTotalBranches += 1
                    }
                    branchCoverage.push({
                        lineNumber: results.coverageMap.data[test.result.url].data.branchMap[branch].line,
                        loc: results.coverageMap.data[test.result.url].data.branchMap[branch].loc,
                        locations: results.coverageMap.data[test.result.url].data.branchMap[branch].locations,
                        isCovered: (results.coverageMap.data[test.result.url].data.b[branch][0] > 0),
                        timesRan: results.coverageMap.data[test.result.url].data.b[branch][0]
                    })
                }
                json.testCoverage.push(
                    {
                        fileName: newPath,
                        code: test.codeTransformResult.originalCode,
                        functionLocation: functionCoverage,
                        statementLocation: statementCoverage,
                        branchLocation: branchCoverage,
                        unCoveredLines: unCoveredLines,
                        functionsPercentCovered: (failedFunctions === 0) ? 100 : Number((100 - ((failedFunctions/functions) * 100)).toFixed(2)),
                        statementsPercentCovered: (failedStatements === 0) ? 100 : Number((100 - ((failedStatements/statements) * 100 )).toFixed(2)),
                        branchesPercentCovered: (failedBranches === 0) ? 100 : Number((100 - ((failedBranches/branches) * 100)).toFixed(2)),
                        failedTest: failedTest
                    }
                )
                functions = 0
                statements = 0
                branches = 0
                failedFunctions = 0
                failedBranches = 0
                failedStatements = 0
                unCoveredLines = []
            })
            json.summaryResults = {
                BranchCoverage: (failedTotalBranches === 0) ? 100 : Number((100 - ((failedTotalBranches/totalBranches) * 100)).toFixed(2)),
                statementCoverage: (failedTotalStatements === 0) ? 100 : Number((100 - ((failedTotalStatements/totalStatements) * 100)).toFixed(2)),
                functionCoverage: (failedTotalFunctions === 0) ? 100 : Number((100 - ((failedTotalFunctions/totalFunctions) * 100)).toFixed(2)),
                totalPassed: numberOfPassedTest,
                totalFailed: numberOfFailedTest,
                totalSkipped: numberOfSkippedTest
            }
        })
        console.log(JSON.stringify(json))
        if(this._options.path != undefined){
            const pathArray = this._options.path.split('/')
            delete pathArray[pathArray.length - 1]
            const pathDir = pathArray.join('/')
            if(fs.existsSync(path.resolve(process.cwd() + '/' + pathDir))){
                fs.writeFileSync(path.resolve(process.cwd() + '/' + this._options.path), JSON.stringify(json))
            } else {
                fs.mkdirSync(pathDir)
                fs.writeFileSync(path.resolve(process.cwd() + '/' + this._options.path), JSON.stringify(json))
            }
        } else {
            if(fs.existsSync(path.resolve(process.cwd() + '/jest-simplified-json'))){
                fs.writeFileSync(path.resolve(process.cwd() + '/jest-simplified-json/results.json'), JSON.stringify(json))
            } else {
                fs.mkdirSync(path.resolve(process.cwd() + '/jest-simplified-json'))
                fs.writeFileSync(path.resolve(process.cwd() + '/jest-simplified-json/results.json'), JSON.stringify(json))
            }
        }
    }
}
module.exports = simplifiedJestReporter