module.exports = (router, route, callback) => {
    if (route.bypass) {
        if (typeof callback === 'function') {
            callback({
                method: route.method.toUpperCase(),
                path: route.path,
                bypass: true
            });
        }
    } else if (route.proxy) {
        router[route.method](route.path, require('./proxy')(route));
        if (typeof callback === 'function') {
            callback({
                method: route.method.toUpperCase(),
                path: route.path,
                proxy: true
            });
        }
    } else {
        router[route.method](
            route.path,
            require('./interpolate')(route),
            (req, res) => {
                const { code, headers, body, delay } = req.$route || {};
                const handler = () => {
                    if (code) {
                        res.status(code);
                    }
                    if (headers) {
                        for (const key in headers) {
                            res.setHeader(key, headers[key]);
                        }
                    }
                    if (body != null) {
                        res.send(body);
                    } else {
                        res.end();
                    }
                };
                if (delay) {
                    setTimeout(handler, delay);
                } else {
                    handler();
                }
            }
        );
        if (typeof callback === 'function') {
            callback({
                method: route.method.toUpperCase(),
                path: route.path
            });
        }
    }
};
