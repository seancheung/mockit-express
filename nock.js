const nock = require('nock');
const Database = require('./src/db');
const interpo = require('./src/interpolate');
const url = require('url');

function mount(scope, route) {
    if (route.bypass) {
        return;
    }
    if (/all/i.test(route.method)) {
        throw new Error(
            `ALL method not supported: "${route.method.toUpperCase()} ${
                route.path
            }"`
        );
    }
    if (/\/:\w+/.test(route.path)) {
        throw new Error(
            `params not supported: "${route.method.toUpperCase()} ${
                route.path
            }"`
        );
    }
    const interceptor = scope.intercept(route.path, route.method.toUpperCase());
    if (route.delay) {
        interceptor.delay(route.delay);
    }
    if (route.proxy) {
        throw new Error(
            `proxy route not supported: "${route.method.toUpperCase()} ${
                route.path
            }"`
        );
    } else {
        interceptor.query(true).reply(function(uri, rb) {
            const req = {
                query: url.parse(uri, true).query,
                body: rb,
                headers: this.req.headers,
                params: {}
            };
            interpo(route)(req, null, () => {});
            const { $route } = req;

            return [$route.code, $route.body, $route.headers];
        });
    }
}

function create(basePath, routes, options) {
    let db;
    if (routes instanceof Database) {
        db = routes;
    } else {
        db = new Database();
        if (typeof routes === 'string') {
            routes = require('./src/load')(routes);
        }
        db.load(routes);
    }
    const scope = nock(basePath, options);
    for (const route of db.all()) {
        mount(scope, route);
    }

    scope.persist(true);

    return {
        stop: nock.cleanAll,
        pause: nock.restore,
        activate: nock.activate
    };
}

create.mount = mount;

module.exports = create;
