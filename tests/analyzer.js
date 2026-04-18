/**
 * Test analyzer module that re-exports core analyzer functions
 * This avoids the need for mocking vscode dependencies in tests
 */

const coreAnalyzer = require('../extension/core.js');

module.exports = {
    parseCFunctions: coreAnalyzer.parseCFunctions,
    parseJavaFunctions: coreAnalyzer.parseJavaFunctions,
    parseJavaScriptFunctions: coreAnalyzer.parseJavaScriptFunctions,
    parsePythonFunctions: coreAnalyzer.parsePythonFunctions,
    calculateComplexity: coreAnalyzer.calculateComplexity
};