const crypto = require('crypto');
const { EventEmitter } = require('events');
const SYMBOLS = {
    db: Symbol(),
    stream: Symbol()
};

function clone(source) {
    return source == null ? source : JSON.parse(JSON.stringify(source));
}

function normalize(url) {
    return url == null
        ? url
        : `/${url.replace(/\/$/, '')}`.replace(/\/{2,}/g, '/');
}

function hash(method, path) {
    path = normalize(path);
    if (!method || !path) {
        throw new Error('invalid arguments');
    }

    return crypto
        .createHash('md5')
        .update(method.toLowerCase() + ' ' + path)
        .digest('hex');
}

module.exports = class Database extends EventEmitter {

    constructor() {
        super();
        this[SYMBOLS.db] = new Map();
    }

    /**
     * Get all records
     */
    *all() {
        for (const [id, doc] of this[SYMBOLS.db]) {
            yield Object.assign({ id }, clone(doc));
        }
    }

    /**
     * Select records with pagination
     *
     * @param {number} [offset]
     * @param {number} [limit]
     */
    *select(offset = 0, limit) {
        let i = 0;
        if (limit != null) {
            limit += offset;
        }
        for (const [id, doc] of this[SYMBOLS.db]) {
            if (limit != null && i >= limit) {
                break;
            }
            if (i++ < offset) {
                continue;
            }
            yield Object.assign({ id }, clone(doc));
        }
    }

    /**
     * Get records count
     *
     * @returns {number}
     */
    count() {
        return this[SYMBOLS.db].size;
    }

    /**
     * Check if an id exists
     *
     * @param {string} id
     * @returns {boolean}
     */
    has(id) {
        return this[SYMBOLS.db].has(id);
    }

    /**
     * Check if a composite key exists
     *
     * @param {string} method
     * @param {string} path
     * @returns {boolean}
     */
    exists(method, path) {
        const id = hash(method, path);

        return this[SYMBOLS.db].has(id);
    }

    /**
     * Find a record by id
     *
     * @param {string} id
     */
    find(id) {
        const doc = this[SYMBOLS.db].get(id);
        if (doc) {
            return Object.assign({ id }, clone(doc));
        }
    }

    /**
     * Insert a record
     *
     * @param {any} doc
     */
    insert(doc) {
        const { method, path } = doc || {};
        const id = hash(method, path);
        doc = clone(doc);
        this[SYMBOLS.db].set(id, doc);
        if (this[SYMBOLS.stream]) {
            this.ydump(this[SYMBOLS.stream]);
        }

        return Object.assign({ id }, clone(doc));
    }

    /**
     * Update a record by id
     *
     * @param {string} id
     * @param {any} data
     */
    update(id, data) {
        const doc = this[SYMBOLS.db].get(id);
        if (!doc) {
            return;
        }
        data = clone(data);
        delete data.method;
        delete data.path;
        Object.assign(doc, data);
        if (this[SYMBOLS.stream]) {
            this.ydump(this[SYMBOLS.stream]);
        }

        return Object.assign({ id }, clone(doc));
    }

    /**
     * Delete a record by id
     *
     * @param {string} id
     * @returns {boolean}
     */
    remove(id) {
        const sucess = this[SYMBOLS.db].delete(id);
        if (this[SYMBOLS.stream]) {
            this.ydump(this[SYMBOLS.stream]);
        }

        return sucess;
    }

    /**
     * Clear all records
     */
    drop() {
        this[SYMBOLS.db].clear();
        if (this[SYMBOLS.stream]) {
            this.ydump(this[SYMBOLS.stream]);
        }
    }

    /**
     * Dump all records to a writable stream in json format
     *
     * @param {WritableStream} stream
     * @returns {Promise<void>}
     */
    dump(stream) {
        return new Promise((resolve, reject) => {
            let i = 0;
            for (const [, doc] of this[SYMBOLS.db]) {
                if (i === 0) {
                    stream.write('{');
                } else {
                    stream.write(',');
                }
                const key = `${doc.method.toUpperCase()} ${doc.path}`;
                const item = clone(doc);
                delete item.method;
                delete item.path;
                stream.write(`"${key}":${JSON.stringify(item)}`);
                i++;
            }
            if (i > 0) {
                stream.write('}');
            }
            stream.end();
            stream.on('finish', () => resolve());
            stream.on('error', error => reject(error));
        });
    }

    /**
     * Dump all records to a writable stream in yaml format
     *
     * @param {WritableStream} stream
     * @returns {Promise<void>}
     */
    ydump(stream) {
        const yaml = require('js-yaml');

        return new Promise((resolve, reject) => {
            for (const [, doc] of this[SYMBOLS.db]) {
                const key = `${doc.method.toUpperCase()} ${doc.path}`;
                const item = clone(doc);
                delete item.method;
                delete item.path;
                const text = yaml
                    .safeDump(item)
                    .split('\n')
                    .filter(line => !!line)
                    .map(line => '  ' + line)
                    .join('\n');
                stream.write(`${key}:\n${text}\n`);
            }
            stream.end();
            stream.on('finish', () => resolve());
            stream.on('error', error => reject(error));
        });
    }

    /**
     * Load records from object
     *
     * @param {{[k: string]: any}} data
     */
    load(data) {
        const docs = Object.entries(data).map(([k, v]) => {
            const [method, path] = k.split(/\s+/, 2);

            return Object.assign(
                {
                    method: method.toLowerCase(),
                    path
                },
                v
            );
        });
        const ids = docs.map(doc => hash(doc.method, doc.path));
        if (new Set(ids).size !== docs.length) {
            throw new Error('duplicate keys found');
        }
        this[SYMBOLS.db].clear();
        docs.forEach((doc, i) => this[SYMBOLS.db].set(ids[i], doc));
        if (this[SYMBOLS.stream]) {
            this.ydump(this[SYMBOLS.stream]);
        }
    }

    persist(stream) {
        this[SYMBOLS.stream] = stream;
    }

};
