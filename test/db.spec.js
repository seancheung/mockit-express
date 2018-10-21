const request = require('supertest');
const mock = require('mock-require');
const Database = require('../src').Database;

describe('routes db test', function() {
    before(function() {
        this.db = new Database();
        mock('./source', this.db);
        this.app = mock.reRequire('./app');
    });

    it('expect GET /api/v1/status 404', async function() {
        await request(this.app)
            .get('/api/v1/status')
            .expect(404);
    });

    it('expect GET /api/v1/status success', async function() {
        this.db.insert({
            method: 'get',
            path: '/api/v1/status',
            code: 200
        });
        await request(this.app)
            .get('/api/v1/status')
            .expect(200);
    });

    after(function() {
        mock.stop('./source');
        mock.reRequire('./app');
    });
});
