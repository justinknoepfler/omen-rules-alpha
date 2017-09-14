const Util = require('./Util.js');
const range = Util.range;

module.exports = {
    getActions: getActions
};

const EVENT_HANDLERS = Object.freeze({
    GAME_START : gameStartHandler
});


function getActions(event, gameState, config) {
    const eventType = event.eventType;
    const handler = EVENT_HANDLERS[eventType];
    const [actions, err] = (handler) ? handler(event, gameState, config) : [[], NO_EVENT_HANDLER_ERR(event, gameState)];
    return [actions, err];
}

function gameStartHandler(event, gameState, config) {
    const numStartingCards = config['numStartingCards'];
    const numResources = config['numStartingResources'];
    const pids = gameState['pids'];

    /**
    const drawCardsActions = pids.map((pid) => range(numStartingCards).map((x) => pid))
        .reduce((flattened, arr) => flattened.concat(arr), [])
        .map((pid) => DrawCardAction({pid:pid}));
     */

    const pidPerCard = pids.map((pid) => range(numStartingCards).map(x => pid)).reduce((flattened, arr) => flattened.concat(arr), []);
    console.log("pidPerCard: " + JSON.stringify(pidPerCard));

    const mapToAction = pidPerCard.map(pidPerCard).map((pid) => DrawCardActions({pid:pid}));
    console.log("mapToAction: " + JSON.stringify(mapToAction));

    const drawResourceActions = range(numResources).map(DrawResourceAction);
    const setPhaseAction = SetPhaseAction('ROUND_START');
    return drawCardsActions.concat(drawResourceActions).concat(setPhaseAction);
}

const NO_EVENT_HANDLER_ERR = Err("No event handler for event type.");

function Err(msg) {
    const message = msg;
    return err;
    function err(event, gameState) {
        return {
            msg: message,
            event: event,
            gameState: gameState
        }
    }
}

const DrawCardAction = Action('DRAW_CARD_ACTION', ['pid']);
const DrawResourceAction = Action('DRAW_RESOURCE_ACTION', []);
const SetPhaseAction = Action('SET_PHASE_ACTION', ['phase']);

function Action(type, keys) {
    const actionType = type;
    return action;
    function action(config) {
        return keys.reduce((map, key) => (map[key] = config[key]), {actionType: type});
    }
}
