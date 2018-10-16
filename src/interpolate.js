const vm = require('vm');

function unescape(exp) {
    return exp.replace(/\\(.)/g, (_, c) => c);
}

function interpolate(src, req) {
    if (typeof src !== 'string') {
        return src;
    }

    return src.replace(/\$\{((?:[^{}\\]|\\.)+)\}/g, (_, exp) => {
        exp = unescape(exp);
        let value = vm.runInNewContext(exp, {
            faker: require('faker'),
            $faker: locale => require(`faker/locale/${locale}`),
            params: req.params,
            query: req.query,
            body: req.body,
            headers: req.headers
        });
        if (typeof value === 'function') {
            value = value.call();
        }
        if (value == null) {
            value = '';
        }
        if (typeof value === 'object') {
            value = JSON.stringify(value);
        }

        return value;
    });
}

module.exports = route => (req, res, next) => {
    const $route = {},
        { code, headers, body, cond, delay } = route;
    if (code) {
        $route.code = route.code;
    }
    if (headers) {
        $route.headers = Object.assign({}, headers);
    }
    if (body != null) {
        $route.body = interpolate(body, req);
    }
    if (delay != null) {
        $route.delay = delay;
    }
    if (cond) {
        for (const item of cond) {
            const success = vm.runInNewContext(item.case, {
                params: req.params,
                query: req.query,
                body: req.body,
                headers: req.headers
            });
            if (success === true) {
                if (item.code) {
                    $route.code = item.code;
                }
                if (item.headers) {
                    $route.headers = Object.assign(
                        $route.headers || {},
                        item.headers
                    );
                }
                if (item.body) {
                    $route.body = interpolate(item.body, req);
                }
                break;
            }
        }
    }
    req.$route = $route;
    next();
};
