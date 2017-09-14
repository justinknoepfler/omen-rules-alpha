module.exports = {
    UUID: UUID
}

function UUID() {
    var id = 1000;

    return {
        next: next
    }

    function next() {
        id += 1;
        return id;
    }
}