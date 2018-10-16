/*eslint no-unused-vars: off*/
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mockit = require('../src');

const router = mockit(path.resolve(__dirname, 'routes.yml'));

const app = express();
app.set('trust proxy', true);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(router);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    // set http status
    res.status(err.status || 500);

    // send error
    res.json({
        error: err.status || 500,
        message: err.message
    });
});

module.exports = app;
