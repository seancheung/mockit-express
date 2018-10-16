const request = require('express-request-proxy');

const vars = {
    remote_addr: req => req.ip,
    host: (_, proxy) => proxy.remote.replace(/^https?:\/{2}/, ''),
    proxy_add_x_forwarded_for: req =>
        req.header('x-forwarded-for')
            ? req.header('x-forwarded-for') + ',' + req.ip
            : req.ip
};

module.exports = route => (req, res, next) => {
    const { remote, rewrite } = route.proxy;
    let path;
    if (rewrite) {
        const [match, target] = rewrite.split(/\s+/, 2);
        const reg = new RegExp(match).exec(req.originalUrl);
        path = target.replace(/\$(\d)/g, (_, i) => reg[i]);
    } else {
        path = req.originalUrl;
    }
    if (/\/$/.test(remote) && /^\//.test(path)) {
        path = path.replace(/^\//, '');
    } else if (!/\/$/.test(remote) && !/^\//.test(path)) {
        path = '/' + path;
    }
    const url = remote + path;
    let headers;
    if (route.proxy.headers) {
        headers = Object.entries(route.proxy.headers).reduce((t, [k, v]) => {
            if (typeof v === 'string') {
                v = v.replace(
                    /\$([\w_]+)/g,
                    (_, i) =>
                        i in vars
                            ? vars[i](req, route.proxy)
                            : _.replace(
                                /\$http_([\w_]+)/g,
                                (_, j) =>
                                    req.header(j.replace(/_/g, '-')) || ''
                            )
                );
                if (!v) {
                    return t;
                }
            }

            return Object.assign(t, { [k]: v });
        }, {});
    } else {
        headers = {};
    }
    request({
        url,
        params: req.params,
        query: req.query,
        headers: Object.assign({}, /*req.headers,*/ headers),
        body: req.body
    })(req, res, next);
};
