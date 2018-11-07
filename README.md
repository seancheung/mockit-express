## mockit-express

[![Master Build][travis-master]][travis-url]

Http API mock router for express application

[travis-master]: https://img.shields.io/travis/seancheung/mockit-express/master.svg?label=master
[travis-url]: https://travis-ci.org/seancheung/mockit-express

## Install

```bash
npm i mockit-express express body-parser
# to enable yaml file format support
npm i js-yaml
# to enable faker support
npm i faker
# to enable proxy support
npm i express-request-proxy
# to enable file watching and auto-reload support
npm i chokidar
# to enable nock support
npm i -D nock
```

## Usage

```javascript
const mockit = require("mockit-express");
const router = mockit("/path/routes/config/file");
app.use("/api/v1", router);
```

Watch config file change and reload automatically

```javascript
const router = mockit("/path/routes/config/file", (err, changed) => {
  if (err) {
    console.error("failed to load config file", err);
  } else if (changed) {
    console.log("file changed");
  } else {
    console.warn("file removed");
  }
});
```

Pass routes directly

```javascript
const router = mockit({ "GET /api/v1/account": { code: 200 } });
```

Use db instance

```javascript
const db = new mockit.Database();
db.load("/path/routes/config/file");
const router = mockit(db);
```

## Config

routes.yml

```yaml
# method and path
GET /api/v1/account:
  # bypass(disable) this route(optional)
  bypass: false
  # simulate response delay in milliseconds(optional)
  delay: 1000
  # http status code
  code: 200
  # response headers(optional)
  headers:
    Content-Type: "application/json"
    Server: "Nginx"
  # response body(string)(optional)
  body: |-
    {
      "name": "admin"
    }
PUT /api/v1/account:
  bypass: false
  delay: 0
  code: 204
  headers:
    Content-Type: "application/json"
    Server: "Nginx"
# match all methods and sub paths
ALL /api/v1/proxy/*:
  # reverse proxy
  proxy:
    # proxy remote
    remote: "https://jsonplaceholder.typicode.com"
    # rewrite rules in nginx style(optional)
    rewrite: ^/api/v1/proxy/(.*) /posts/$1
    # proxy headers(optional)
    headers:
      # see Proxy Header Variables for details
      X-Real-IP: $remote_addr
      X-Forwarded-For: $proxy_add_x_forwarded_for
      X-Mockit-Proxy: true
      Upgrade: $http_upgrade
      User-Agent: $http_user_agent
      Connection: "upgrade"
      Host: $host
# using params in url
GET /api/v1/users/:id:
  code: 404
  headers:
    Content-Type: "application/json"
  body: |-
    {
      "id": 0,
      "name": "unknown"
    }
  # using conditions
  cond:
    - case: params.id == 1
      code: 200
      body: |-
        {
          "id": 1,
          "name": "Alfonzo"
        }
    - case: params.id == 2
      code: 200
      body: |-
        {
          "id": 2
          "name": "Juanita"
        }
GET /api/v1/members/:id:
  code: 200
  headers:
    Content-Type: "application/json"
  # see Interpolation for details
  body: |-
    {
      "index": ${params.id},
      "uid": ${faker.random.number() + params.id},
      "name": "${faker.internet.userName()}",
      "fullname": "${faker('zh_CN').name.firstName}${faker('zh_CN').name.lastName()}"
      "email": "${faker.internet.email}",
      "location": {
        "latitude": ${faker.address.latitude},
        "longitude": ${faker.address.longitude}
      },
      "desc": "${faker.lorem.paragraph}",
      "escape": "${'\{' + 'using curly braces inside interpo template' + '\}'}"
    }
```

routes.json

```json
{
  "GET /api/v1/account": {
    "bypass": false,
    "delay": 1000,
    "code": 200,
    "headers": {
      "Content-Type": "application/json",
      "Server": "Nginx"
    },
    "body": "{\"name\":\"admin\"}"
  },
  "PUT /api/v1/account": {
    "bypass": false,
    "delay": 0,
    "code": 200,
    "headers": {
      "Content-Type": "application/json",
      "Server": "Nginx"
    }
  },
  "ALL /api/v1/proxy/*": {
    "proxy": {
      "remote": "https://jsonplaceholder.typicode.com",
      "rewrite": "^/api/v1/proxy/(.*) /posts/$1",
      "headers": {
        "X-Real-IP": "$remote_addr",
        "X-Forwarded-For": "$proxy_add_x_forwarded_for",
        "X-Mockit-Proxy": true,
        "Upgrade": "$http_upgrade",
        "User-Agent": "$http_user_agent",
        "Connection": "upgrade",
        "Host": "$host"
      }
    }
  },
  "GET /api/v1/users/:id": {
    "code": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"id\":0,\"name\":\"unknown\"}",
    "cond": [
      {
        "case": "params.id == 1",
        "body": "{\"id\":1,\"name\":\"Alfonzo\"}"
      },
      {
        "case": "params.id == 2",
        "body": "{\"id\":2,\"name\":\"Juanita\"}"
      }
    ]
  },
  "GET /api/v1/members/:id": {
    "code": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"index\":${params.id},\"uid\":${faker.random.number() + params.id},\"name\":\"${faker.internet.userName()}\",\"fullname\":\"${faker(\"zh_CN\").name.firstName}${faker(\"zh_CN\").name.lastName()}\",\"email\":\"${faker.internet.email}\",\"location\": {\"latitude\":${faker.address.latitude},\"longitude\":${faker.address.longitude}},\"desc\":\"${faker.lorem.paragraph}\",\"escape\":\"${'\\{' + 'using curly braces inside interpo template' + '\\}'}\"}"
  }
}
```

### Proxy Header Variables

**$host**

Proxy remote host name

**$remote_addr**

Client request IP

**$proxy_add_x_forwarded_for**

Concat client `X-Forwarded-For` header(if exists) with Client IP

**$http\_{name}**

Request header field in snakecase

e.g.

`$http_user_agent` returns client header `User-Agent`

### Interpolation

Expressions encaptured by `${` and `}` in `body` field will be interpolated.

**Basic**

`"${'string field'}"` => `"string field"`

`${1 + 1}` => `2`

`"${'\{using curly braces inside interpolation\}'}"` => `"{using curly braces inside interpolation}"`

**Accessing `params`, `query`, `body` and `headers`**

> `params` keeps the passed-in parameters in route url, `query` stores request query string values, `body` and `headers` hold request body and headers respectively

_Definition: /api/v1/items/:id_

_Request URL: /api/v1/items/12?color=red_

_Request Headers: {'x-version':'1.31'}_

_Request body: '{"count": 9}'_

`${params.id}` => `12`

`${query.color}` => `"red"`

`${body.data}` => `{"count": 9}`

`${headers['x-version']}` => `"1.31"`

**Faking data**

> `faker` is a [thirdparty library](http://marak.github.io/faker.js)

`${faker.random.number()}` => `1289`

`${faker.random.number}` => `4096`

> the first example calls a function and returns the result

> the second example returns a function which will be called without context

`"${faker.name.firstName}"` => `"James"`

> `$faker` is an additional function which can be called to use a specific locale(for the current context only)

`"${$faker('zh_CN').name.firstName}"` => `"朱"`

> see **[faker](http://marak.github.io/faker.js)** for reference

## Test

```bash
npm test
```

## Integrate into Webpack

```javascript
const mockit = require("mockit-express");
//...
module.exports = {
  //...
  devServer: {
    after: function(app) {
      app.use(mockit("/path/routes/file"));
    }
  }
};
```

## Integrate with nock

> Proxy routes and routes with params are not supported when using nock. 'ALL' method is also forbidden

load a file

```javascript
const nockit = require("mockit-express/nock");
const scope = nockit("http://domain.com", "/path/to/routes/file");
// alias for nock.cleanAll()
scope.stop();
// alias for nock.restore()
scope.pause();
// alias for nock.activate()
scope.activate();
```

Load existing data

```javascript
nockit("http://domain.com", db);
nockit("http://domain.com", {
  "GET /api/v1/test": {
    code: 200,
    delay: 1000,
    body: "success"
  }
});
```

Add to exising nock scope

```javascript
nockit.mount(scope, route);
```

## Standalone

See [mockit](https://github.com/seancheung/mockit)

## License

See [License](https://github.com/seancheung/mockit-express/blob/master/LICENSE)
