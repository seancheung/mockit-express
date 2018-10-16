const request = require('supertest');
const { expect } = require('chai');

describe('routes basic test', function() {
    before(function() {
        this.app = require('./app');
    });

    it('expect GET /api/v1/status success', async function() {
        await request(this.app)
            .get('/api/v1/status')
            .expect(200);
    });

    it('expect GET /api/v1/bypass success', async function() {
        await request(this.app)
            .get('/api/v1/bypass')
            .expect(404);
    });

    it('expect GET /api/v1/delay success', async function() {
        const time = Date.now();
        await request(this.app)
            .get('/api/v1/delay')
            .expect(204)
            .expect(() => {
                expect(Date.now() - time).to.be.gt(100);
            });
    });

    it('expect HEAD /api/v1/status success', async function() {
        await request(this.app)
            .head('/api/v1/status')
            .expect(204)
            .expect('x-version', '1.0.0');
    });

    it('expect POST /api/v1/data success', async function() {
        await request(this.app)
            .post('/api/v1/data')
            .expect(201)
            .expect('content-type', /json/)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('id')
                    .that.eqls(123);
                expect(res.body.key).to.eq('abc');
            });
    });

    it('expect GET/POST/PUT/HEAD/DELETE /api/v1/all success', async function() {
        await Promise.all(
            ['get', 'post', 'put', 'head', 'delete'].map(method =>
                request(this.app)[method]('/api/v1/all').expect(204)
            )
        );
    });
});
