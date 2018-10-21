module.exports = function(filename) {
    const fs = require('fs');
    let routes;
    if (/\.json$/i.test(filename)) {
        routes = JSON.parse(fs.readFileSync(filename, 'utf8'));
    } else if (/\.ya?ml$/i.test(filename)) {
        routes = require('js-yaml').safeLoad(fs.readFileSync(filename, 'utf8'));
    } else {
        throw new Error('Unsupported file type: ' + filename);
    }

    return routes;
};
