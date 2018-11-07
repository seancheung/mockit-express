const path = require('path');
const { expect } = require('chai');
const request = require('request-promise');
const errors = require('request-promise/errors');
const nock = require('../nock');

describe('nock test', function() {
    before(function() {
        this.host = 'http://localhost:22222';
        this.nock = nock(this.host, path.resolve(__dirname, 'nock.yml'));
        this.request = request.defaults({
            baseUrl: this.host,
            resolveWithFullResponse: true,
            json: true,
            simple: false
        });
    });

    it('expect GET /api/v1/status success', async function() {
        const res = await this.request.get('/api/v1/status');
        expect(res.statusCode).to.eql(200);
    });

    it('expect GET /api/v1/bypass success', async function() {
        await this.request
            .get('/api/v1/bypass')
            .then(() => {
                throw new Error();
            })
            .catch(err => {
                expect(err).to.be.instanceOf(errors.RequestError);
            });
    });

    it('expect GET /api/v1/delay success', async function() {
        const time = Date.now();
        const res = await this.request('/api/v1/delay');
        expect(res.statusCode).to.eql(204);
        expect(Date.now() - time).to.be.gt(100);
    });

    it('expect POST /api/v1/data success', async function() {
        const res = await this.request.post('/api/v1/data');
        expect(res.statusCode).to.eql(201);
        expect(res.headers['Content-Type']).to.match(/json/);
        expect(res.body)
            .to.be.an('object')
            .with.property('id')
            .that.eqls(123);
        expect(res.body.key).to.eq('abc');
    });

    it('expect GET /api/v1/cond?id=1 success', async function() {
        const res = await this.request.get('/api/v1/cond?id=1');
        expect(res.statusCode).to.eql(200);
        expect(res.body)
            .to.be.an('object')
            .with.property('id')
            .that.eqls(1);
    });

    it('expect GET /api/v1/cond?id=2 success', async function() {
        const res = await this.request.get('/api/v1/cond?id=2');
        expect(res.statusCode).to.eql(200);
        expect(res.body)
            .to.be.an('object')
            .with.property('name')
            .that.eqls('Eve');
    });

    it('expect GET /api/v1/cond?id=3 success', async function() {
        const res = await this.request.get('/api/v1/cond?id=3');
        expect(res.statusCode).to.eql(404);
        expect(res.body)
            .to.be.an('object')
            .with.property('id')
            .that.eqls(null);
    });

    it('expect POST /api/v1/interpo?i=3&s=50 success', async function() {
        const res = await this.request.post('/api/v1/interpo?i=3&s=50', {
            headers: { 'x-platform': 'android' },
            body: {
                name: 'math',
                count: 100
            }
        });
        expect(res.statusCode).to.eql(201);
        expect(res.body).to.eql({
            page: {
                index: 3,
                size: 50
            },
            platform: 'android',
            data: {
                name: 'math',
                count: 101
            }
        });
    });

    it('expect GET /api/v1/faker success', async function() {
        const res = await this.request.get('/api/v1/faker');
        expect(res.statusCode).to.eql(200);
        expect(res.body).to.be.an('object');
        expect(res.body.id).to.be.a('number');
        expect(res.body.name).to.be.a('string');
        expect(res.body.fullname).to.be.a('string');
        expect(/\S+@\S+\.\S+/.test(res.body.email)).to.be.true;
        expect(res.body.location)
            .to.be.an('object')
            .with.property('longitude');
        expect(res.body.desc).to.be.a('string');
        expect(/^\{.+\}$/.test(res.body.escape)).to.be.true;
    });

    after(function() {
        this.nock.stop();
    });
});
