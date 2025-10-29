import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

describe('Volunteer API', () => {
  test('POST /api/volunteers should validate required fields', async () => {
    const response = await request(app)
      .post('/api/volunteers')
      .send({})
      .expect(400);

    assert.strictEqual(response.body.message, 'Validation failed');
    assert(Array.isArray(response.body.errors));
    assert(response.body.errors.length > 0);
  });

  test('POST /api/volunteers should validate email format', async () => {
    const response = await request(app)
      .post('/api/volunteers')
      .send({
        fullName: 'John Doe',
        email: 'invalid-email',
        phone: '+91 98765 43210',
        areasOfInterest: ['Education & Tutoring'],
        availability: 'Weekends only'
      })
      .expect(400);

    const emailError = response.body.errors.find(err => err.field === 'email');
    assert(emailError);
    assert(emailError.message.includes('valid email'));
  });

  test('POST /api/volunteers should validate phone format', async () => {
    const response = await request(app)
      .post('/api/volunteers')
      .send({
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123',
        areasOfInterest: ['Education & Tutoring'],
        availability: 'Weekends only'
      })
      .expect(400);

    const phoneError = response.body.errors.find(err => err.field === 'phone');
    assert(phoneError);
    assert(phoneError.message.includes('valid phone'));
  });

  test('GET /api/volunteers should return volunteer list', async () => {
    const response = await request(app)
      .get('/api/volunteers')
      .expect(200);

    assert(typeof response.body === 'object');
    assert(Array.isArray(response.body.volunteers));
    assert(typeof response.body.pagination === 'object');
  });

  test('GET /api/volunteers/stats should return statistics', async () => {
    const response = await request(app)
      .get('/api/volunteers/stats')
      .expect(200);

    assert(typeof response.body.total === 'number');
    assert(typeof response.body.recent === 'number');
    assert(typeof response.body.byStatus === 'object');
    assert(typeof response.body.byStatus.new === 'number');
    assert(typeof response.body.byStatus.reviewed === 'number');
    assert(typeof response.body.byStatus.accepted === 'number');
    assert(typeof response.body.byStatus.rejected === 'number');
  });
});