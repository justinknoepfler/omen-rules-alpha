const Rules = require('./Rules.js');
const GameState = require('./GameState.js');

function handleEvent(event) {
    const [actions, err] = Rules.getActions(event, gameState);
    const nextState = (! err) ? GameState.takeActions(actions) : gameState;
    return [nextState, err];
}