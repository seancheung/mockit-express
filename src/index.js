const { Router } = require('express');
const Database = require('./db');
const mount = require('./mount');

function createRouter(db, filename) {
    if (filename === null) {
        db.drop();
    } else if (typeof filename === 'string') {
        const routes = require('./load')(filename);
        db.load(routes);
    } else if (typeof filename === 'object') {
        db.load(filename);
    } else {
        throw new Error('invalid route config');
    }
    const router = Router({ mergeParams: true });
    for (const doc of db.all()) {
        mount(router, doc);
    }

    return router;
}

function watchFile(filename, callback) {
    require('chokidar')
        .watch(filename)
        .on('change', function(filename) {
            callback(null, filename);
        })
        .on('unlink', function() {
            callback(null, null);
        })
        .on('error', err => callback(err));
}

function mockit(filename, watchCallback) {
    const db = new Database();
    const router = Router({ mergeParams: true });
    let subRouter = createRouter(db, filename);
    router.use((req, res, next) => {
        if (subRouter) {
            subRouter(req, res, next);
        } else {
            next();
        }
    });

    if (typeof watchCallback === 'function') {
        watchFile(filename, (err, filename) => {
            if (err) {
                watchCallback(err);
            } else {
                watchCallback(null, filename != null);
                subRouter = createRouter(db, filename);
            }
        });
    }

    return router;
}

mockit.default = mockit;

module.exports = mockit;
