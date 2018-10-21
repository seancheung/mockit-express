const { Router } = require('express');
const Database = require('./db');
const mount = require('./mount');

function create(db, callback) {
    const router = Router({ mergeParams: true });
    for (const doc of db.all()) {
        mount(router, doc, callback);
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

function mockit(filename, watchCallback, mountCallback) {
    let db;
    if (typeof filename === 'string') {
        db = new Database();
    } else {
        mountCallback = watchCallback;
        watchCallback = null;
        if (filename instanceof Database) {
            // db
            db = filename;
        } else if (typeof filename === 'object') {
            db = new Database();
        } else {
            throw new Error('invalid file type');
        }
    }
    const router = Router({ mergeParams: true });
    let subRouter;
    router.use((req, res, next) => {
        if (subRouter) {
            subRouter(req, res, next);
        } else {
            next();
        }
    });

    db.hook(db => {
        subRouter = create(db, mountCallback);
    });

    if (typeof watchCallback === 'function') {
        watchFile(filename, (err, filename) => {
            if (err) {
                watchCallback(err);
            } else {
                try {
                    if (filename) {
                        db.load(require('./load')(filename));
                    } else {
                        db.drop();
                    }
                } catch (error) {
                    watchCallback(null, filename != null);

                    return;
                }
                watchCallback(null, filename != null);
            }
        });
    }

    if (typeof filename === 'string') {
        db.load(require('./load')(filename));
    } else if (filename instanceof Database) {
        subRouter = create(filename, mountCallback);
    } else {
        db.load(filename);
    }

    return router;
}

mockit.Database = Database;
mockit.default = mockit;

module.exports = mockit;
