const request = require('supertest');
const { expect } = require('chai');

describe('routes interpo cond test', function() {
    before(function() {
        this.app = require('./app');
    });

    it('expect GET /api/v1/cond/1 success', async function() {
        await request(this.app)
            .get('/api/v1/cond/1')
            .expect(200)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('id')
                    .that.eqls(1);
            });
    });

    it('expect GET /api/v1/cond/2 success', async function() {
        await request(this.app)
            .get('/api/v1/cond/2')
            .expect(200)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('name')
                    .that.eqls('Eve');
            });
    });

    it('expect GET /api/v1/cond/3 success', async function() {
        await request(this.app)
            .get('/api/v1/cond/3')
            .expect(404)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('id')
                    .that.eqls(null);
            });
    });
});
