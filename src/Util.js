module.exports = {
    range: range
}

/**
 * Return an array from [0..x]
 */
function range(x) {
    return Array.from({length:x}, (v, i) => i);
}