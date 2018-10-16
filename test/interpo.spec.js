const request = require('supertest');
const { expect } = require('chai');

describe('routes interpo test', function() {
    before(function() {
        this.app = require('./app');
    });

    it('expect POST /api/v1/interpo/book?i=3&s=50 success', async function() {
        await request(this.app)
            .post('/api/v1/interpo/book?i=3&s=50')
            .set('x-platform', 'android')
            .type('json')
            .send({
                name: 'math',
                count: 100
            })
            .expect(201)
            .expect(res => {
                expect(res.body).to.eql({
                    cat: 'book',
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
    });

    it('expect GET /api/v1/faker success', async function() {
        await request(this.app)
            .get('/api/v1/faker')
            .expect(200)
            .expect(res => {
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
    });
});
