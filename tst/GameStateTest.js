module.exports = {
    name: "GameStateTest",
    testInitialState: testInitialState,
    testDealCardToPlayer: testDealCardToPlayer,
    testExtractByUUID: testExtractByUUID,
    testStageCard: testStageCard,
    testUnstageCard: testUnstageCard
};

const Deck = require('../src/Deck.js');
const GameState = require('../src/GameState.js');
const TestUtil = require('./TestUtil.js');
const UUID = require('../src/UUID.js');

function testInitialState() {
    const pids = ['bot_001', 'bot_002', 'bot_003'];
    const deckDescription = {'red': 4, 'blue': 4, 'green':4};
    const playerDeckDescriptions = pids.map((pid) => ({[pid]:deckDescription})).reduce((map, entry) => (Object.assign(map, entry)), {});
    const resourceDeckDescription = {'cheese':3, 'apple':3, 'snoda':3};
    const config = {
        pids: pids,
        playerDeckDescriptions: playerDeckDescriptions,
        resourceDeckDescription: resourceDeckDescription,
        uuid: UUID.UUID()
    };

    const initialState = GameState.getInitialState(config);
    const gsPids = initialState['pids'];
    const isPidsCorrect = Array.isArray(pids)
        && (gsPids.length === pids.length)
        && (gsPids.map((pid) => (pids.includes(pid))).reduce((conj, bool) => (bool && conj), true));
    const isSuccess = isPidsCorrect;
    const details = {
        isPidsCorrect: isPidsCorrect,
        inputPids: pids,
        outputPids: gsPids
    };
    return TestUtil.TestResult(testInitialState, isSuccess, details);
}

function testDealCardToPlayer() {
    const pids = ['bot_001', 'bot_002', 'bot_003'];
    const deckDescription = {'red': 4, 'blue': 4, 'green':4};
    const playerDeckDescriptions = pids.map((pid) => ({[pid]:deckDescription})).reduce((map, entry) => (Object.assign(map, entry)), {});
    const resourceDeckDescription = {'cheese':3, 'apple':3, 'snoda':3};
    const config = {
        pids: pids,
        playerDeckDescriptions: playerDeckDescriptions,
        resourceDeckDescription: resourceDeckDescription,
        uuid: UUID.UUID()
    };
    const initialState = GameState.getInitialState(config);
    const [expectedCard, expectedDeck] = Deck.pop(initialState['playerDecks']['bot_001']);
    const newState = GameState.dealCardToPlayer('bot_001', initialState);
    const actualCard = newState['playerHands']['bot_001'][0];
    const actualDeck = newState['playerDecks']['bot_001'];
    const isDeckCorrect = Array.isArray(actualDeck)
        && (actualDeck.length === expectedDeck.length)
        && (Array.from({length: actualDeck.length}, (v, i) => i)
            .map((i) => (actualDeck[i]['uuid'] === expectedDeck[i]['uuid']))
            .reduce((conj, bool) => (conj && bool), true));
    const isCardCorrect = (actualCard['uuid'] === expectedCard['uuid']);
    const isSuccess = (isDeckCorrect && isCardCorrect);
    const details = {
        isDeckCorrect: isDeckCorrect,
        actualDeck: actualDeck,
        expectedDeck: expectedDeck,
        isCardCorrect: isCardCorrect,
        actualCard: actualCard,
        expectedCard: expectedCard
    };
    return TestUtil.TestResult(testDealCardToPlayer, isSuccess, details);
}

function testStageCard() {
    const pids = ['bot_001', 'bot_002', 'bot_003'];
    const deckDescription = {'red': 1, 'blue': 1, 'green':1};
    const playerDeckDescriptions = pids.map((pid) => ({[pid]:deckDescription})).reduce((map, entry) => (Object.assign(map, entry)), {});
    const resourceDeckDescription = {'cheese':1, 'apple':1, 'snoda':1};
    const config = {
        pids: pids,
        playerDeckDescriptions: playerDeckDescriptions,
        resourceDeckDescription: resourceDeckDescription,
        uuid: UUID.UUID()
    };
    const initialState = GameState.getInitialState(config);
    const testState = GameState.dealCardToPlayer('bot_002', initialState);
    const resourceUUID = "ham";
    const playerID = "bot_002";
    const cardUUID = testState['playerHands']['bot_002'][0]['uuid'];
    const newTestState = GameState.stageCard('bot_002', cardUUID, resourceUUID, testState);
    const stagedCards = newTestState['resourceStagedCards'][resourceUUID]['bot_002'];
    const isResourceStaged = (Array.isArray(stagedCards)) && (stagedCards[0]['uuid'] === cardUUID) && (stagedCards.length === 1);
    const isSuccess = isResourceStaged;
    const details = {
        preState: testState,
        postState: newTestState
    }

    return TestUtil.TestResult(testStageCard, isSuccess, details);
}

function testUnstageCard() {

    const pids = ['bot_001', 'bot_002', 'bot_003'];
    const deckDescription = {'red': 1, 'blue': 1, 'green':1};
    const playerDeckDescriptions = pids.map((pid) => ({[pid]:deckDescription})).reduce((map, entry) => (Object.assign(map, entry)), {});
    const resourceDeckDescription = {'cheese':1, 'apple':1, 'snoda':1};
    const config = {
        pids: pids,
        playerDeckDescriptions: playerDeckDescriptions,
        resourceDeckDescription: resourceDeckDescription,
        uuid: UUID.UUID()
    };
    const initialState = GameState.getInitialState(config);
    const preState = GameState.GameStateBuilder(initialState).withResourceStagedCards({"ham":{'bot_002':[{'uuid':1, 'rid':2}]}}).build();
    const postState = GameState.unstageCard('bot_002', 1, "ham", preState);
    const details = {
        preState: preState,
        postState: postState
    }

    return TestUtil.TestResult(testUnstageCard, false, details);

}

function testExtractByUUID() {
    const collection = Array.from({length: 5}, (v, i) => i).map((i) => ({uuid: i, rid: i}));
    const [resource, rest] = GameState.extractByUUID(3, collection);
    const isExtractedResourceCorrect = (resource !== null) && (resource['uuid'] === 3) && (resource['rid'] === 3);
    const remainingUUIDS = rest.map((x) => x['uuid']);
    const isOriginalUnmodified = (collection.length === 5);
    const isRestCorrect = Array.isArray(rest)
        && (rest.length === 4)
        && ([0, 1, 2, 4].map((x) => (remainingUUIDS.includes(x))).reduce((conj, bool) => (conj && bool), true));
    const isSuccess = isExtractedResourceCorrect && isRestCorrect && isOriginalUnmodified;
    const details = {
        collection: collection,
        resource: resource,
        rest: rest,
        isOrginialUnmodified: isOriginalUnmodified,
        isRestCorrect: isRestCorrect,
        isExtractedResourceCorrect: isExtractedResourceCorrect
    }
    return TestUtil.TestResult(testExtractByUUID, isSuccess, details);
}
