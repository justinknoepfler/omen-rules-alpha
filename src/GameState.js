module.exports = {
    adjustScore: adjustScore,
    applyActions: applyActions,
    beginPhase: beginPhase,
    dealCardToPlayer: dealCardToPlayer,
    dealContestedResource: dealContestedResource,
    extractByUUID: extractByUUID,
    GameStateBuilder: GameStateBuilder,
    getInitialState: getInitialState,
    removeContestedResource: removeContestedResource,
    stageCard: stageCard,
    unstageCard: unstageCard
};

/**
 * GameState
 *
 * Library for creating and manipulating GameStates. Each GameState contains:
 *
 * pids: an array of player identifiers.
 * playerTokens: a map from each pid to an array of resources ({uuid: STRING, rid: STRING}).
 * playerTokenDecks: a map from each pid to an array of resources ({uuid: STRING, rid: STRING}).
 * resourceDeck: an array of resources ({uuid: STRING, rid: STRING}).
 * contestedResources: an array of resources ({uuid: STRING, rid: STRING}).
 * playerScores: a map from pid->integer
 *
 * In general, transitioning between two states is accomplished with the applyAction(action, state) method.
 * applyAction consumes an action (see Actions.js) and a current state, and outputs a new state.
 *
 */

const Deck = require('./Deck.js');

/** Game Phases **/
const INITTIAL_PHASE = 'initialPhase';

/** GameState Keys **/
const PIDS = 'pids';
const PLAYER_DECKS = 'playerDecks';
const PLAYER_HANDS = 'playerHands';
const RESOURCE_DECK = 'resourceDeck';
const CONTESTED_RESOURCES = 'contestedResources';
const RESOURCE_STAGED_CARDS = 'resourceStagedCards';
const PHASE = 'phase';
const UUID = 'uuid';
const RID = 'rid';
const PLAYER_SCORES = 'playerScores';


function applyActions(actions, gameState) {

}

function beginPhase(phase, gameState) {
    return GameStateBuilder(gameState).withPhase(phase).build();
}

function dealCardToPlayer(pid, gameState) {
    const playerDecks = gameState[PLAYER_DECKS];
    const playerDeck = playerDecks[pid];
    const playerHands = gameState[PLAYER_HANDS];
    const playerHand = playerHands[pid];

    const [card, newPlayerDeck] = Deck.pop(playerDeck);
    const newPlayerHand = playerHand.concat(card);
    const newPlayerHands = PlayerHandsBuilder(playerHands).withPlayerHand(pid, newPlayerHand).build();
    const newPlayerDecks = PlayerDecksBuilder(playerDecks).withPlayerDeck(pid, newPlayerDeck).build();
    return GameStateBuilder(gameState)
        .withPlayerDecks(newPlayerDecks)
        .withPlayerHands(newPlayerHands)
        .build();
}

function dealContestedResource(gameState) {
    const resourceDeck = gameState[RESOURCE_DECK];
    const contestedResources = gameState[CONTESTED_RESOURCES];
    const [card, newResourceDeck] = Deck.pop(resourceDeck);
    const newContestedResources = contestedResources.concat(card);
    return GameStateBuilder(gameState)
        .withResourceDeck(newResourceDeck)
        .withContestedResources(newContestedResources)
        .build();
}

function removeContestedResource(uuid, gameState) {
    const contestedResources = gameState[CONTESTED_RESOURCES];
    const [r, newContestedResources] = extractByUUID(uuid, contestedResources);
    return GameStateBuilder(gameState)
        .withContestedResources(newContestedResources)
        .build();
}

function adjustScore(pid, adjustment, gameState) {
    const scores = gameState[PLAYER_SCORES];
    const newScore = scores[pid] + adjustment;
    const newScores = Object.freeze(Object.assign({}, scores, {[pid]: newScore}));
    return GameStateBuilder(gameState)
        .withPlayerScores(newScores)
        .build();
}

function stageCard(pid, uuidCard, uuidResource, gameState) {
    const allResourceStagedCards = gameState[RESOURCE_STAGED_CARDS];
    const resourceStagedCards = allResourceStagedCards[uuidResource] || {};
    const playerResourceStagedCards = resourceStagedCards[pid] || [];
    const playerHands = gameState[PLAYER_HANDS];
    const playerHand = playerHands[pid];
    const [card, newPlayerHand] = extractByUUID(uuidCard, playerHand);
    const newPlayerResourceStagedCards = playerResourceStagedCards.concat(card);
    const newResourceStagedCards = PlayerStagedCardsBuilder(resourceStagedCards)
        .withPlayerStagedCards(pid, newPlayerResourceStagedCards)
        .build();
    const newAllResourceStagedCards = ResourceStagedCardsBuilder(allResourceStagedCards)
        .withResourceStagedCards(uuidResource, newResourceStagedCards)
        .build();
    const newPlayerHands = PlayerHandsBuilder(playerHands)
        .withPlayerHand(newPlayerHand)
        .build();

    return GameStateBuilder(gameState)
        .withResourceStagedCards(newAllResourceStagedCards)
        .withPlayerHands(newPlayerHands)
        .build();
}

/**
 * Return a card from staging to a player's hand.
 */
function unstageCard(pid, uuidCard, uuidResource, gameState) {
    const allResourceStagedCards = gameState[RESOURCE_STAGED_CARDS];
    const resourceStagedCards = allResourceStagedCards[uuidResource] || {};
    const playerResourceStagedCards = resourceStagedCards[pid] || [];
    const playerHands = gameState[PLAYER_HANDS];
    const playerHand = playerHands[pid];
    const [card, newPlayerResourceStagedCards] = extractByUUID(uuidCard, playerResourceStagedCards);
    const newPlayerHand = playerHand.concat(card);
    const newResourceStagedCards = PlayerStagedCardsBuilder(resourceStagedCards)
        .withPlayerStagedCards(pid, newPlayerResourceStagedCards)
        .build();
    const newAllResourceStagedCards = ResourceStagedCardsBuilder(allResourceStagedCards)
        .withResourceStagedCards(uuidResource, newResourceStagedCards)
        .build();
    const newPlayerHands = PlayerHandsBuilder(playerHands)
        .withPlayerHand(pid, newPlayerHand)
        .build();

    return GameStateBuilder(gameState)
        .withResourceStagedCards(newAllResourceStagedCards)
        .withPlayerHands(newPlayerHands)
        .build();
}

/**
 * Searchs collection for obj satisfying (obj['uuid'] === uuid).
 * Returns [obj, remainder]. Obj may be null. Remainder is a shallow copy of collection without obj. The original
 * collection is not modified.
 */
function extractByUUID(uuid, collection) {
    return collection.reduce(([target, remainder], resource) =>
        (resource[UUID] === uuid) ? [resource, remainder] : [target, remainder.concat(resource)], [null, []]);
}


function getInitialState(config) {
    const pids = config['pids'];
    const playerDeckDescriptions = config['playerDeckDescriptions'];
    const resourceDeckDescription = config['resourceDeckDescription'];
    const uuid = config['uuid'];
    const playerDecks = pids.reduce((builder, pid) => builder.withPlayerDeck(pid, Deck.shuffle(Deck.from(playerDeckDescriptions[pid], uuid))), PlayerDecksBuilder()).build();
    const resourceDeck = Deck.from(resourceDeckDescription, uuid);
    const playerHands = pids.reduce((builder, pid) => (builder.withPlayerHand(pid, [])), PlayerHandsBuilder()).build();
    const contestedResources = {};
    const resourceStagedCards = {};
    const scores = pids.map((pid) => ({[pid]:0})).reduce((obj, score) => Object.assign({}, obj, score), {});
    return GameStateBuilder()
        .withPhase(INITTIAL_PHASE)
        .withPids(pids)
        .withPlayerDecks(playerDecks)
        .withPlayerHands(playerHands)
        .withResourceDeck(resourceDeck)
        .withContestedResources(contestedResources)
        .withResourceStagedCards(resourceStagedCards)
        .withPlayerScores(scores)
        .build();
}

function GameStateBuilder(s) {

    const state = Object.freeze((typeof s === 'undefined') ? {} : Object.assign({}, s));

    return {
        withPids: withPids,
        withPlayerHands: withPlayerHands,
        withContestedResources: withContestedResources,
        withPlayerDecks: withPlayerDecks,
        withResourceStagedCards: withResourceStagedCards,
        withResourceDeck: withResourceDeck,
        withPhase: withPhase,
        withPlayerScores: withPlayerScores,
        build: build
    };

    function withPids(pids) {
        return GameStateBuilder(Object.assign({}, state, {[PIDS]: pids}));
    }

    function withPlayerHands(playerHands) {
        return GameStateBuilder(Object.assign({}, state, {[PLAYER_HANDS]: playerHands}));
    }

    function withContestedResources(contestedResources) {
        return GameStateBuilder(Object.assign({}, state, {[CONTESTED_RESOURCES]: contestedResources}));
    }

    function withPlayerDecks(playerDecks) {
        return GameStateBuilder(Object.assign({}, state, {[PLAYER_DECKS]: playerDecks}));
    }

    function withResourceDeck(resourceDeck) {
        return GameStateBuilder(Object.assign({}, state, {[RESOURCE_DECK]: resourceDeck}));
    }

    function withResourceStagedCards(resourceStagedCards) {
        return GameStateBuilder(Object.assign({}, state, {[RESOURCE_STAGED_CARDS]: resourceStagedCards}));
    }

    function withPlayerScores(scores) {
        return GameStateBuilder(Object.assign({}, state, {[PLAYER_SCORES]: scores}));
    }

    function withPhase(phase) {
        return GameStateBuilder(Object.assign({}, state, {[PHASE]: phase}));
    }

    function build() {
        return state;
    }
}

function PlayerDecksBuilder(decks) {

    const playerDecks = Object.freeze((typeof decks === 'undefined') ? {} : Object.assign({}, decks));

    return {
        withPlayerDeck: withPlayerDeck,
        build: build
    };

    function withPlayerDeck(pid, deck) {
        return PlayerDecksBuilder(Object.assign({}, playerDecks, {[pid]: deck}));
    }

    function build() {
        return playerDecks;
    }
}

function PlayerHandsBuilder(hands) {

    const playerHands = Object.freeze((typeof hands === 'undefined') ? {} : Object.assign({}, hands));

    return {
        withPlayerHand: withPlayerHand,
        build: build
    };

    function withPlayerHand(pid, hand) {
        return PlayerHandsBuilder(Object.assign({}, playerHands, {[pid]: hand}));
    }

    function build() {
        return playerHands;
    }
}

function PlayerStagedCardsBuilder(stagedCards) {
    const playerStagedCards = Object.freeze((typeof stagedCards === 'undefined') ? {} : Object.assign({}, stagedCards));

    return {
        withPlayerStagedCards: withPlayerStagedCards,
        build: build
    };

    function withPlayerStagedCards(pid, cards) {
        return PlayerStagedCardsBuilder(Object.assign({}, playerStagedCards, {[pid]: cards}));
    }

    function build() {
        return playerStagedCards;
    }
}

/**
 * Move a card from a player's hand to staging on a resource.
 */
function ResourceStagedCardsBuilder(stagedCards) {

    const resourceStagedCards = Object.freeze((typeof stagedCards === 'undefined') ? {} : Object.assign({}, stagedCards));

    return {
        withResourceStagedCards: withResourceStagedCards,
        build: build
    };

    function withResourceStagedCards(uuid, cards) {
        return ResourceStagedCardsBuilder(Object.assign({}, resourceStagedCards, {[uuid]: cards}));
    }

    function build() {
        return resourceStagedCards;
    }
}

