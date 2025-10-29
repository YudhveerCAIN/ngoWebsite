import request from 'supertest';
import app from '../app.js';
import Volunteer from '../models/Volunteer.js';

describe('Volunteer Controller', () => {
  describe('POST /api/volunteers', () => {
    const validVolunteerData = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      areasOfInterest: ['Education & Tutoring', 'Community Development'],
      availability: 'Weekends only',
      experience: 'I have volunteered at local schools for 2 years',
      message: 'I am passionate about education and want to help'
    };

    test('should create volunteer with valid data', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send(validVolunteerData)
        .expect(201);

      expect(response.body).toMatchObject({
        fullName: validVolunteerData.fullName,
        email: validVolunteerData.email,
        status: 'new',
        message: expect.stringContaining('successfully')
      });

      // Verify volunteer was saved to database
      const volunteer = await Volunteer.findById(response.body.id);
      expect(volunteer).toBeTruthy();
      expect(volunteer.fullName).toBe(validVolunteerData.fullName);
      expect(volunteer.areasOfInterest).toEqual(validVolunteerData.areasOfInterest);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'fullName',
            message: expect.stringContaining('required')
          }),
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('required')
          }),
          expect.objectContaining({
            field: 'phone',
            message: expect.stringContaining('required')
          })
        ])
      );
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          ...validVolunteerData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('valid email')
          })
        ])
      );
    });

    test('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          ...validVolunteerData,
          phone: '123'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'phone',
            message: expect.stringContaining('valid phone')
          })
        ])
      );
    });

    test('should require at least one area of interest', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          ...validVolunteerData,
          areasOfInterest: []
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'areasOfInterest',
            message: expect.stringContaining('at least one')
          })
        ])
      );
    });

    test('should prevent duplicate email addresses', async () => {
      // Create first volunteer
      await request(app)
        .post('/api/volunteers')
        .send(validVolunteerData)
        .expect(201);

      // Try to create second volunteer with same email
      const response = await request(app)
        .post('/api/volunteers')
        .send(validVolunteerData)
        .expect(400);

      expect(response.body.message).toContain('already exists');
      expect(response.body.code).toBe('DUPLICATE_EMAIL');
    });

    test('should validate name length', async () => {
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          ...validVolunteerData,
          fullName: 'A'
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'fullName',
            message: expect.stringContaining('at least 2 characters')
          })
        ])
      );
    });

    test('should validate experience length', async () => {
      const longExperience = 'A'.repeat(1001);
      const response = await request(app)
        .post('/api/volunteers')
        .send({
          ...validVolunteerData,
          experience: longExperience
        })
        .expect(400);

      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'experience',
            message: expect.stringContaining('less than 1000 characters')
          })
        ])
      );
    });
  });

  describe('GET /api/volunteers', () => {
    beforeEach(async () => {
      // Create test volunteers
      await Volunteer.create([
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          areasOfInterest: ['Education & Tutoring'],
          availability: 'Weekends only',
          status: 'new'
        },
        {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 98765 43211',
          areasOfInterest: ['Healthcare & Medical Support'],
          availability: 'Flexible schedule',
          status: 'reviewed'
        },
        {
          fullName: 'Bob Johnson',
          email: 'bob@example.com',
          phone: '+91 98765 43212',
          areasOfInterest: ['Environmental Conservation'],
          availability: 'Weekdays only',
          status: 'accepted'
        }
      ]);
    });

    test('should list all volunteers with pagination', async () => {
      const response = await request(app)
        .get('/api/volunteers')
        .expect(200);

      expect(response.body.volunteers).toHaveLength(3);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      });
    });

    test('should filter volunteers by status', async () => {
      const response = await request(app)
        .get('/api/volunteers?status=reviewed')
        .expect(200);

      expect(response.body.volunteers).toHaveLength(1);
      expect(response.body.volunteers[0].status).toBe('reviewed');
    });

    test('should search volunteers by name', async () => {
      const response = await request(app)
        .get('/api/volunteers?search=John')
        .expect(200);

      expect(response.body.volunteers).toHaveLength(1);
      expect(response.body.volunteers[0].fullName).toBe('John Doe');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/volunteers?page=1&limit=2')
        .expect(200);

      expect(response.body.volunteers).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        pages: 2
      });
    });
  });

  describe('GET /api/volunteers/stats', () => {
    beforeEach(async () => {
      await Volunteer.create([
        {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          areasOfInterest: ['Education & Tutoring'],
          availability: 'Weekends only',
          status: 'new'
        },
        {
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91 98765 43211',
          areasOfInterest: ['Healthcare & Medical Support'],
          availability: 'Flexible schedule',
          status: 'accepted'
        }
      ]);
    });

    test('should return volunteer statistics', async () => {
      const response = await request(app)
        .get('/api/volunteers/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        total: 2,
        recent: 2,
        byStatus: {
          new: 1,
          reviewed: 0,
          accepted: 1,
          rejected: 0
        }
      });
    });
  });

  describe('PUT /api/volunteers/:id/status', () => {
    let volunteerId;

    beforeEach(async () => {
      const volunteer = await Volunteer.create({
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        areasOfInterest: ['Education & Tutoring'],
        availability: 'Weekends only',
        status: 'new'
      });
      volunteerId = volunteer._id;
    });

    test('should update volunteer status', async () => {
      const response = await request(app)
        .put(`/api/volunteers/${volunteerId}/status`)
        .send({
          status: 'accepted',
          notes: 'Great candidate for education programs'
        })
        .expect(200);

      expect(response.body.volunteer.status).toBe('accepted');
      expect(response.body.volunteer.notes).toBe('Great candidate for education programs');
      expect(response.body.volunteer.reviewedAt).toBeTruthy();
    });

    test('should validate status values', async () => {
      const response = await request(app)
        .put(`/api/volunteers/${volunteerId}/status`)
        .send({
          status: 'invalid-status'
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid status');
    });

    test('should return 404 for non-existent volunteer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app)
        .put(`/api/volunteers/${fakeId}/status`)
        .send({
          status: 'accepted'
        })
        .expect(404);
    });
  });
});