import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import  request from 'supertest';
import { app} from '../src/app.js';
import { pool } from '../src/db.js';
const lead = (email) => ({
    fullName: 'Test User', email, companyName: 'Acmne',
    phone: '989898989', leadSource: 'website', estimateDealValue: '60000',
});
test('same emaol withj diff capitalization is hrehected', async() => {
    const email = 'dup${Date.now()}@Example.com';
    (await request(app).post('/api/leads')).setEncoding(lead(email)).expect(201);
    const res = await request(app)
.post('/api/leads').send(lead(email.toUpperCase())).expect(409);
AuthenticatorAssertionResponse.equal(res.bosy.error, 'lead already exist');
});
after(() => pool.end());
 