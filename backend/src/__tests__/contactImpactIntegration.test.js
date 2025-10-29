import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../app.js';
import ContactInquiry from '../models/ContactInquiry.js';
import mongoose from 'mongoose';

describe('Contact and Impact Integration', () => {
  const validContactData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    subject: 'General Inquiry',
    message: 'I would like to know more about your programs and how I can contribute to your mission.'
  };

  beforeEach(async () => {
    // Clean up test data before each test
    if (mongoose.connection.readyState === 1) {
      await ContactInquiry.deleteMany({ email: { $regex: /@example\.com$/ } });
    }
  });

  afterEach(async () => {
    // Clean up test data after each test
    if (mongoose.connection.readyState === 1) {
      await ContactInquiry.deleteMany({ email: { $regex: /@example\.com$/ } });
    }
  });

  test('contact submission affects impact statistics', async () => {
    // Get initial impact statistics
    const initialImpactResponse = await request(app)
      .get('/api/impact')
      .expect(200);
    
    const initialInquiries = initialImpactResponse.body.totalInquiries;
    const initialRecentInquiries = initialImpactResponse.body.recentInquiries;

    // Submit a contact inquiry
    const contactResponse = await request(app)
      .post('/api/contact')
      .send(validContactData)
      .expect(201);

    assert.strictEqual(contactResponse.body.name, validContactData.name);
    assert.strictEqual(contactResponse.body.status, 'new');

    // Get updated impact statistics
    const updatedImpactResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    // Total inquiries should increase by 1
    assert.strictEqual(
      updatedImpactResponse.body.totalInquiries,
      initialInquiries + 1
    );

    // Recent inquiries should also increase by 1
    assert.strictEqual(
      updatedImpactResponse.body.recentInquiries,
      initialRecentInquiries + 1
    );
  });

  test('multiple contact submissions update statistics correctly', async () => {
    // Get initial statistics
    const initialResponse = await request(app)
      .get('/api/impact')
      .expect(200);
    
    const initialTotal = initialResponse.body.totalInquiries;

    // Submit multiple contact inquiries
    const submissions = [];
    for (let i = 0; i < 5; i++) {
      const contactData = {
        ...validContactData,
        email: `user${i}@example.com`,
        name: `User ${i}`,
        message: `Message from user ${i}`
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      submissions.push(response.body);
    }

    // Verify all submissions were successful
    assert.strictEqual(submissions.length, 5);
    submissions.forEach((submission, index) => {
      assert.strictEqual(submission.name, `User ${index}`);
      assert.strictEqual(submission.status, 'new');
    });

    // Check updated statistics
    const finalResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    assert.strictEqual(
      finalResponse.body.totalInquiries,
      initialTotal + 5
    );
  });

  test('contact inquiry status changes affect statistics', async () => {
    // Submit a contact inquiry
    const contactResponse = await request(app)
      .post('/api/contact')
      .send(validContactData)
      .expect(201);

    const inquiryId = contactResponse.body.id;

    // Get contact statistics
    const initialStatsResponse = await request(app)
      .get('/api/contact/stats')
      .expect(200);

    const initialNewCount = initialStatsResponse.body.byStatus.new;
    const initialRespondedCount = initialStatsResponse.body.byStatus.responded;

    // Update inquiry status to 'responded'
    await request(app)
      .put(`/api/contact/${inquiryId}/status`)
      .send({
        status: 'responded',
        response: 'Thank you for your inquiry. We will get back to you soon.'
      })
      .expect(200);

    // Check updated statistics
    const updatedStatsResponse = await request(app)
      .get('/api/contact/stats')
      .expect(200);

    // New count should decrease by 1
    assert.strictEqual(
      updatedStatsResponse.body.byStatus.new,
      initialNewCount - 1
    );

    // Responded count should increase by 1
    assert.strictEqual(
      updatedStatsResponse.body.byStatus.responded,
      initialRespondedCount + 1
    );
  });

  test('impact statistics include contact data in calculations', async () => {
    // Submit several inquiries with different subjects
    const subjects = [
      'Volunteer Opportunities',
      'Donation Information',
      'Partnership Proposal',
      'General Inquiry'
    ];

    for (let i = 0; i < subjects.length; i++) {
      await request(app)
        .post('/api/contact')
        .send({
          ...validContactData,
          email: `subject${i}@example.com`,
          subject: subjects[i],
          message: `Inquiry about ${subjects[i]}`
        })
        .expect(201);
    }

    // Get impact statistics
    const impactResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    // Verify that contact inquiries contribute to overall engagement metrics
    assert(typeof impactResponse.body.totalInquiries === 'number');
    assert(impactResponse.body.totalInquiries >= subjects.length);
    
    // Check that recent inquiries are tracked
    assert(typeof impactResponse.body.recentInquiries === 'number');
    assert(impactResponse.body.recentInquiries >= subjects.length);
  });

  test('impact trends include contact inquiry data', async () => {
    // Submit contact inquiries
    await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        email: 'trends@example.com'
      })
      .expect(201);

    // Get impact trends
    const trendsResponse = await request(app)
      .get('/api/impact/trends?months=1')
      .expect(200);

    assert(Array.isArray(trendsResponse.body));
    assert(trendsResponse.body.length > 0);

    // Current month should include the inquiry
    const currentMonth = trendsResponse.body[trendsResponse.body.length - 1];
    assert(typeof currentMonth.inquiries === 'number');
    assert(currentMonth.inquiries >= 1);
    assert(typeof currentMonth.total === 'number');
  });

  test('contact and impact APIs handle errors consistently', async () => {
    // Test invalid contact submission
    const invalidContactResponse = await request(app)
      .post('/api/contact')
      .send({
        name: 'A', // Too short
        email: 'invalid-email',
        subject: '',
        message: 'Short'
      })
      .expect(400);

    assert.strictEqual(invalidContactResponse.body.message, 'Validation failed');
    assert(Array.isArray(invalidContactResponse.body.errors));

    // Impact API should still work normally
    const impactResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    assert(typeof impactResponse.body.totalInquiries === 'number');
  });

  test('contact inquiry search affects impact calculations', async () => {
    // Submit inquiries with searchable content
    const searchableInquiries = [
      {
        ...validContactData,
        email: 'education@example.com',
        name: 'Education Seeker',
        subject: 'Education Programs',
        message: 'I am interested in your education programs'
      },
      {
        ...validContactData,
        email: 'volunteer@example.com',
        name: 'Volunteer Candidate',
        subject: 'Volunteer Opportunities',
        message: 'I want to volunteer for your organization'
      }
    ];

    for (const inquiry of searchableInquiries) {
      await request(app)
        .post('/api/contact')
        .send(inquiry)
        .expect(201);
    }

    // Search for education-related inquiries
    const searchResponse = await request(app)
      .get('/api/contact?search=education')
      .expect(200);

    assert(Array.isArray(searchResponse.body.inquiries));
    assert(searchResponse.body.inquiries.length >= 1);

    // Verify search results contain education-related inquiry
    const educationInquiry = searchResponse.body.inquiries.find(
      inquiry => inquiry.subject.includes('Education')
    );
    assert(educationInquiry);
    assert.strictEqual(educationInquiry.name, 'Education Seeker');

    // Impact statistics should include all inquiries
    const impactResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    assert(impactResponse.body.totalInquiries >= searchableInquiries.length);
  });

  test('contact inquiry filtering works with impact data', async () => {
    // Submit inquiries and update some statuses
    const inquiry1Response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        email: 'filter1@example.com',
        name: 'Filter Test 1'
      })
      .expect(201);

    const inquiry2Response = await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        email: 'filter2@example.com',
        name: 'Filter Test 2'
      })
      .expect(201);

    // Update one inquiry status
    await request(app)
      .put(`/api/contact/${inquiry1Response.body.id}/status`)
      .send({
        status: 'responded',
        response: 'Thank you for your inquiry'
      })
      .expect(200);

    // Filter by status
    const newInquiriesResponse = await request(app)
      .get('/api/contact?status=new')
      .expect(200);

    const respondedInquiriesResponse = await request(app)
      .get('/api/contact?status=responded')
      .expect(200);

    // Verify filtering works
    assert(newInquiriesResponse.body.inquiries.length >= 1);
    assert(respondedInquiriesResponse.body.inquiries.length >= 1);

    // All new inquiries should have status 'new'
    newInquiriesResponse.body.inquiries.forEach(inquiry => {
      assert.strictEqual(inquiry.status, 'new');
    });

    // All responded inquiries should have status 'responded'
    respondedInquiriesResponse.body.inquiries.forEach(inquiry => {
      assert.strictEqual(inquiry.status, 'responded');
    });

    // Impact statistics should reflect all inquiries regardless of status
    const impactResponse = await request(app)
      .get('/api/impact')
      .expect(200);

    assert(impactResponse.body.totalInquiries >= 2);
  });

  test('contact and impact data consistency over time periods', async () => {
    // Submit contact inquiry
    await request(app)
      .post('/api/contact')
      .send({
        ...validContactData,
        email: 'period@example.com'
      })
      .expect(201);

    // Check monthly period statistics
    const monthlyResponse = await request(app)
      .get('/api/impact/period/month')
      .expect(200);

    assert.strictEqual(monthlyResponse.body.period, 'month');
    assert(typeof monthlyResponse.body.newInquiries === 'number');
    assert(monthlyResponse.body.newInquiries >= 1);

    // Check quarterly period statistics
    const quarterlyResponse = await request(app)
      .get('/api/impact/period/quarter')
      .expect(200);

    assert.strictEqual(quarterlyResponse.body.period, 'quarter');
    assert(typeof quarterlyResponse.body.newInquiries === 'number');
    assert(quarterlyResponse.body.newInquiries >= 1);

    // Check yearly period statistics
    const yearlyResponse = await request(app)
      .get('/api/impact/period/year')
      .expect(200);

    assert.strictEqual(yearlyResponse.body.period, 'year');
    assert(typeof yearlyResponse.body.newInquiries === 'number');
    assert(yearlyResponse.body.newInquiries >= 1);
  });
});