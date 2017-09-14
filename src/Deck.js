module.exports = {
    from: from,
    pop: pop,
    shuffle: shuffle,

}

/**
 * Consumes: map from resource-id to quantity.
 * Produces: array of [[uuid, resource-id], [uuid, resource-id]...]] with specified multiplicity of each resource-id.
 */
function from(deckDescription, uuid) {
    return Object.entries(deckDescription)
        .map(([id, quantity]) => Array.from({length: quantity}, (v, i) => ({uuid: uuid.next(), rid: id})))
        .reduce((arr, partial) => arr.concat(partial), []);
}

/**
 * Consumes: deck
 * Produces: [deck[0], deck[1...]] if deck is not empty; [null, []] otherwise.
 */
function pop(deck) {
    if (deck.length > 0) {
        return [deck[0], deck.slice(1)];
    } else {
        return [null, []];
    }
}

/**
 * Consumes: deck
 * Produces: deck with same entries, re-ordered pseudo-randomly.
 */
function shuffle(deck) {
    return deck.map((card) => [Math.random(), card]).sort((a, b) => ((a[0] < b[0]) ? -1 : 1)).map(([i, v]) => v);
}







