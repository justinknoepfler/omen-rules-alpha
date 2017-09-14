module.exports = {
    results: results,
    passFail: passFail,
    TestResult: TestResult,
    getTestStartingState: getTestStartingState,
    getTestConfig: getTestConfig
};

const UUID = require('../src/UUID.js');
const GameState = require('../src/GameState.js');

/**
 * Consumes a list of functions, produces an array of results. Assumes that each function
 * will return an array of partial results which it flattens into a single array.
 */
function results(tests) {
    return tests.map(test => test()).reduce((arr, partial) => arr.concat(partial), []);
}

function passFail(testResults) {
    const passed = testResults.filter((result) => result.isSuccess);
    const failed = testResults.filter((result) => (! result.isSuccess));
    return [passed, failed];
}

/**
 * TestResult consumes a function, a boolean isSuccess, and a JSON blob containing arbitrary details about
 * a test run to speed up identifying where/why a test failed.
 */
function TestResult(test, isSuccess, details) {
    return Object.assign({testName: test.name}, {isSuccess: isSuccess}, {details: details});
}

/**
 * Return a gameState initialized to have three players, simple action and resource decks.
 */
function getTestStartingState() {
    const pids = ['bot_001', 'bot_002', 'bot_003'];
    const deckDescription = {'red': 1, 'blue': 1, 'green': 1};
    const playerDeckDescriptions = pids.map((pid) => ({[pid]: deckDescription})).reduce((map, entry) => (Object.assign(map, entry)), {});
    const resourceDeckDescription = {'cheese': 1, 'apple': 1, 'snoda': 1};
    const config = {
        pids: pids,
        playerDeckDescriptions: playerDeckDescriptions,
        resourceDeckDescription: resourceDeckDescription,
        uuid: UUID.UUID()
    };
    return GameState.getInitialState(config);
}

function getTestConfig() {
    return {
        numStartingCards:3,
        numStartingResources:1
    }
}


