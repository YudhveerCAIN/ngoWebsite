import { test, describe } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';

describe('Contact API', () => {
  const validContactData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    subject: 'General Inquiry',
    message: 'I would like to know more about your programs and how I can contribute to your mission.'
  };

  test('POST /api/contact should create contact inquiry with valid data', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send(validContactData)
      .expect(201);

    assert.strictEqual(response.body.name, validContactData.name);
    assert.strictEqual(response.body.email, validContactData.email);
    assert.strictEqual(response.body.subject, validContactData.subject);
    assert.strictEqual(response.body.status, 'new');
    assert(response.body.id);
    assert(response.body.message.includes('successfully'));
  });

  test('POST /api/contact should validate required fields', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({})
      .expect(400);

    assert.strictEqual(response.body.message, 'Validation failed');
    assert(Array.isArray(response.body.errors));
    
    const requiredFields = ['name', 'email', 'subject', 'message'];
    requiredFields.forEach(field => {
      const fieldError = response.body.errors.find(err => err.field === field);
      assert(fieldError, `Should have error for ${field}`);
    });
  });

  test('POST /api/contact should validate email format', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        email: 'invalid-email'
      })
      .expect(400);

    const emailError = response.body.errors.find(err => err.field === 'email');
    assert(emailError);
    assert(emailError.message.includes('valid email'));
  });

  test('POST /api/contact should validate phone format', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        phone: '123'
      })
      .expect(400);

    const phoneError = response.body.errors.find(err => err.field === 'phone');
    assert(phoneError);
    assert(phoneError.message.includes('valid phone'));
  });

  test('POST /api/contact should validate name length', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        name: 'A'
      })
      .expect(400);

    const nameError = response.body.errors.find(err => err.field === 'name');
    assert(nameError);
    assert(nameError.message.includes('at least 2 characters'));
  });

  test('POST /api/contact should validate message length', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        message: 'Short'
      })
      .expect(400);

    const messageError = response.body.errors.find(err => err.field === 'message');
    assert(messageError);
    assert(messageError.message.includes('at least 10 characters'));
  });

  test('POST /api/contact should validate subject length', async () => {
    const longSubject = 'A'.repeat(201);
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        subject: longSubject
      })
      .expect(400);

    const subjectError = response.body.errors.find(err => err.field === 'subject');
    assert(subjectError);
    assert(subjectError.message.includes('less than 200 characters'));
  });

  test('POST /api/contact should validate message max length', async () => {
    const longMessage = 'A'.repeat(2001);
    const response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        message: longMessage
      })
      .expect(400);

    const messageError = response.body.errors.find(err => err.field === 'message');
    assert(messageError);
    assert(messageError.message.includes('less than 2000 characters'));
  });

  test('POST /api/contact should work without optional phone field', async () => {
    const dataWithoutPhone = {
      ...validContactData,
      phone: undefined
    };
    delete dataWithoutPhone.phone;

    const response = await request(app)
      .post('/api/contact')
      .send(dataWithoutPhone)
      .expect(201);

    assert.strictEqual(response.body.name, validContactData.name);
    assert.strictEqual(response.body.email, validContactData.email);
  });

  test('GET /api/contact should return contact inquiries list', async () => {
    const response = await request(app)
      .get('/api/contact')
      .expect(200);

    assert(typeof response.body === 'object');
    assert(Array.isArray(response.body.inquiries));
    assert(typeof response.body.pagination === 'object');
  });

  test('GET /api/contact/stats should return statistics', async () => {
    const response = await request(app)
      .get('/api/contact/stats')
      .expect(200);

    assert(typeof response.body.total === 'number');
    assert(typeof response.body.recent === 'number');
    assert(typeof response.body.byStatus === 'object');
    assert(typeof response.body.byStatus.new === 'number');
    assert(typeof response.body.byStatus.responded === 'number');
    assert(typeof response.body.byStatus.closed === 'number');
  });

  test('GET /api/contact with status filter should filter inquiries', async () => {
    const response = await request(app)
      .get('/api/contact?status=new')
      .expect(200);

    assert(Array.isArray(response.body.inquiries));
    // All returned inquiries should have status 'new'
    response.body.inquiries.forEach(inquiry => {
      assert.strictEqual(inquiry.status, 'new');
    });
  });

  test('GET /api/contact with search should search inquiries', async () => {
    const response = await request(app)
      .get('/api/contact?search=john')
      .expect(200);

    assert(Array.isArray(response.body.inquiries));
  });

  test('PUT /api/contact/:id/status should validate status values', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    
    const response = await request(app)
      .put(`/api/contact/${fakeId}/status`)
      .send({
        status: 'invalid-status'
      })
      .expect(400);

    assert(response.body.message.includes('Invalid status'));
  });

  test('PUT /api/contact/:id/status should return 404 for non-existent inquiry', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    
    await request(app)
      .put(`/api/contact/${fakeId}/status`)
      .send({
        status: 'responded',
        response: 'Thank you for your inquiry'
      })
      .expect(404);
  });

  test('GET /api/contact/:id should return 404 for non-existent inquiry', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    
    await request(app)
      .get(`/api/contact/${fakeId}`)
      .expect(404);
  });
});