var DeckTest = require('./DeckTest.js');
var GameStateTest = require('./GameStateTest.js');
var RulesTest = require('./RulesTest.js');
var TestUtil = require('./TestUtil.js');


//runTestSuite(DeckTest);
//runTestSuite(GameStateTest);
runTestSuite(RulesTest);

/**
 * Consumes a JSON object assumed to contain a list of tests exported by a test library.
 *
 * For example:
 *
 * var deckTest = require('./DeckTest.js');
 * results = getTestSuiteResults(deckTest);
 */
function runTestSuite(suite) {
    const tests = Object.getOwnPropertyNames(suite).filter((name) => (typeof suite[name] === 'function')).map((name) => suite[name]);
    const results = TestUtil.results(tests);
    const failed = results.filter((result) => (! result.isSuccess));
    const numFailed = failed.length;
    const numTests = results.length;
    if (numFailed > 0) {
        console.log(suite.name + "\t\tFAILED [" + numFailed + "/" + numTests + "]:");
        failed.forEach(function (result) {
            console.log("\t" + JSON.stringify(result['testName']));
            Object.getOwnPropertyNames(result['details']).forEach((name) => console.log("\t\t" + name + ": " + JSON.stringify(result['details'][name])));});
    } else {
        console.log(suite.name + "\t\tPASSED [" + numTests + "/" + numTests + "]");
    }
}