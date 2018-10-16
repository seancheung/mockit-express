const request = require('supertest');
const { expect } = require('chai');

describe('routes proxy test', function() {
    before(async function() {
        this.app = require('./app');
        const proxy = require('express')();
        proxy.get('/posts', (req, res) => res.json([{ id: 1 }]));
        proxy.get('/posts/:id', (req, res) => res.json({ id: req.params.id }));
        proxy.post('/posts', (req, res) => res.status(201).json({ id: 1 }));
        proxy.delete('/posts/:id', (req, res) => res.status(204).end());
        this.server = proxy.listen(10123, '127.0.0.1');

        await new Promise((resolve, reject) => {
            this.server.on('listening', resolve);
            this.server.on('error', reject);
        });
    });

    it('expect GET /api/v1/proxy success', async function() {
        await request(this.app)
            .get('/api/v1/proxy')
            .expect(200)
            .expect(res => {
                expect(res.body)
                    .to.be.an('array')
                    .with.lengthOf(1);
            });
    });

    it('expect GET /api/v1/proxy/12 success', async function() {
        await request(this.app)
            .get('/api/v1/proxy/12')
            .expect(200)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('id')
                    .that.eqls('12');
            });
    });

    it('expect POST /api/v1/proxy success', async function() {
        await request(this.app)
            .post('/api/v1/proxy')
            .expect(201)
            .expect(res => {
                expect(res.body)
                    .to.be.an('object')
                    .with.property('id')
                    .that.eqls(1);
            });
    });

    it('expect DELETE /api/v1/proxy/1 success', async function() {
        await request(this.app)
            .delete('/api/v1/proxy/1')
            .expect(204);
    });

    after(async function() {
        await new Promise(resolve => {
            this.server.close(resolve);
        });
    });
});
