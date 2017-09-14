module.exports = {
    name: 'DeckTest',
    testFrom: testFrom,
    testPop: testPop,
    testShuffle: testShuffle
};

var Deck = require('../src/Deck.js');
var UUID = require('../src/UUID.js');
var TestUtil = require('./TestUtil.js');

function testFrom() {
    return [testFromEmpty, testFromDescription].map((test) => test());
}

function testPop() {
    return [testPopNormal, testPopEmpty].map((test) => test());
}

function testShuffle() {
    return [testShuffleNormal].map((test) => test());
}

function testFromEmpty() {
    const uuid = UUID.UUID();
    const emptyDescription = {};
    const emptyDeck = Deck.from(emptyDescription, uuid);
    const isArray = Array.isArray(emptyDeck);
    const isEmpty = (emptyDeck.length === 0);
    const isCorrect = (isArray && isEmpty);
    return TestUtil.TestResult(testFromEmpty, isCorrect, {isEmpty: isEmpty, isCorrect: isCorrect});
}

function testFromDescription() {
    const uuid = UUID.UUID();
    const description = {"red" : 4, "blue" : 5, "green" : 7};
    const deck = Deck.from(description, uuid);
    const [numRed, numGreen, numBlue] = deck.reduce(function ([r, g, b, o], item) {
        if (item['rid'] === "red") {
            return [r+1, g, b, o];
        } else if (item['rid'] === "green") {
            return [r, g+1, b, o];
        } else if (item['rid'] === "blue") {
            return [r, g, b+1, o];
        } else {
            return [r, g, b, o+1];
        }
    }, [0,0,0,0]);
    const isCountCorrect = (numRed === 4) && (numGreen === 7) && (numBlue === 5);
    return TestUtil.TestResult(testFromDescription, isCountCorrect, {deck: deck, redCount: numRed, blueCount: numBlue, greenCount: numGreen});
}

function testPopNormal() {
    const uuid = UUID.UUID();
    const deck = Deck.from({"red" : 4, "blue" : 5, "green" : 7}, uuid);
    const expectedHead = deck[0];
    const expectedTail = deck.slice(1, deck.length);
    const [actualHead, actualTail] = Deck.pop(deck);
    const isHeadCorrect = (expectedHead['uuid'] === actualHead['uuid']);
    const isTailCorrect = Array.from({length: expectedTail.length}, (v, i) => i)
        .map((i) => expectedTail[i]['uuid'] === actualTail[i]['uuid'])
        .reduce((conjunction, bool) => (conjunction && bool), true);
    const isSuccess = (isHeadCorrect && isTailCorrect);
    const details = {
        isHeadCorrect: isHeadCorrect,
        isTailCorrect: isTailCorrect,
        expectedHead: expectedHead,
        expectedTail: expectedTail,
        actualHead: actualHead,
        actualTail: actualTail
    }
    return TestUtil.TestResult(testPopNormal, isSuccess, details);
}

function testPopEmpty() {
    const deck = [];
    const expectedHead = null;
    const [actualHead, actualTail] = Deck.pop(deck);
    const isHeadCorrect = (actualHead === expectedHead);
    const isTailCorrect = ((actualTail.length === 0) && (Array.isArray(actualTail)));
    const isSuccess = (isHeadCorrect && isTailCorrect);
    const details = {
        isHeadCorrect: isHeadCorrect,
        isTailCorrect: isTailCorrect,
        expectedHead: expectedHead,
        expectedTail: [],
        actualHead: actualHead,
        actualTail: actualTail
    }
    return TestUtil.TestResult(testPopNormal, isSuccess, details);
}

function testShuffleNormal() {
    const uuid = UUID.UUID();
    const deck = Deck.from({"red" : 10, "blue" : 8, "green" : 9}, uuid);
    const shuffledDeck = Deck.shuffle(deck);
    const isArray = Array.isArray(shuffledDeck);
    const isLengthCorrect = (shuffledDeck.length === deck.length);
    const [numRed, numGreen, numBlue] = deck.reduce(function ([r, g, b, o], item) {
        if (item['rid'] === "red") {
            return [r+1, g, b, o];
        } else if (item['rid'] === "green") {
            return [r, g+1, b, o];
        } else if (item['rid'] === "blue") {
            return [r, g, b+1, o];
        } else {
            return [r, g, b, o+1];
        }
    }, [0,0,0,0]);
    const isCountCorrect = (numRed === 10) && (numGreen === 9) && (numBlue === 8);
    const isShuffled = Array.from({length: shuffledDeck.length}, (v, i) => i)
        .map((x) => ((shuffledDeck[x]['uuid'] !== deck[x]['uuid'])))
        .reduce((disj, bool) => (bool || disj), false);
    const isSuccess = (isArray && isLengthCorrect && isCountCorrect && isShuffled);
    const details = {
        isArray: isArray,
        isLengthCorrect: isLengthCorrect,
        isCountCorrect: isCountCorrect,
        isShuffled: isShuffled,
        deck: deck,
        shuffledDeck: shuffledDeck,
        warn: "There is a 1/27! chance that isShuffled will spuriously return false, rerun under those conditions."
    };

    return TestUtil.TestResult(testShuffleNormal, isSuccess, details);
}


