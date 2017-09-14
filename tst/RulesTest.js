module.exports = {
    startGameTest: startGameTest
};

const GameState = require('../src/GameState.js');
const Rules = require('../src/Rules.js');
const TestUtil = require('./TestUtil.js');

function startGameTest() {
    const initialGameState = TestUtil.getTestStartingState();
    const config = TestUtil.getTestConfig();
    const actions = Rules.getActions({eventType: 'GAME_START'}, initialGameState, config);
    console.log(JSON.stringify("actions: " + actions));
    const numStartingCards = config['numStartingCards'];
    const numStartingResources = config['numStartingResources'];
    const pids = initialGameState['pids'];
    const numDealActions = actions.filter((action) => (action.type === 'DEAL_CARD_ACTION'))
        .reduce((counts, action) => (counts[action.pid] = ((counts[action.pid] || 0) + 1)), {});
    console.log(JSON.stringify(numDealActions));

    const isNumDealsCorrect = Object.values(numDealActions).reduce((allCorrect, val) => (allCorrect && (val === numStartingCards)), true);
    const isSuccess = isNumDealsCorrect;
    const details = {
        numDealActions: numDealActions,
        initialGameState: initialGameState,
        actions: actions
    }
    return TestUtil.TestResult(startGameTest, isSuccess, details);
}

