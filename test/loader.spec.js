const path = require('path');
const request = require('supertest');
const { expect } = require('chai');
const mock = require('mock-require');
const load = require('../src/load');

describe('routes loader test', function() {
    before(function() {
        this.routes = load(path.resolve(__dirname, 'routes.yml'));
        mock('./source', this.routes);
        this.app = mock.reRequire('./app');
    });

    it('expect load success', function() {
        expect(this.routes).to.be.an('object');
        expect(this.routes).to.have.property('HEAD /api/v1/status');
    });

    it('expect GET /api/v1/status success', async function() {
        await request(this.app)
            .get('/api/v1/status')
            .expect(200);
    });

    after(function() {
        mock.stop('./source');
        mock.reRequire('./app');
    });
});
