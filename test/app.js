/*eslint no-unused-vars: off*/
const express = require('express');
const bodyParser = require('body-parser');
const mockit = require('../src');
const source = require('./source');

const router = mockit(source);

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
