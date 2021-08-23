const request = require('supertest');

const app = require('../../app');
const { connectMongoDB, disconnectMongoDB } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');

describe('Launches API', () => {
  beforeAll(async () => {
    await connectMongoDB();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await disconnectMongoDB();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 status', async () => {
      await request(app)
        .get('/v1/launches')
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launches', () => {
    const launchWithDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS2',
      launchDate: 'December 2, 2030',
      target: 'Kepler-442 b'
    };

    const launchWithoutDate = {
      mission: 'Kepler Exploration X',
      rocket: 'Explorer IS2',
      target: 'Kepler-442 b'
    };

    const launchWithInvalidDate = {
      ...launchWithoutDate,
      launchDate: 'qwerty'
    };

    test('It should respond with 201 status', async () => {
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithDate)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(launchWithDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launchWithoutDate);
    });

    test('It should catch missing required fields', async () => {
      const error = 'Missing required field';
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({ error });
    });

    test('It should catch invalid dates', async () => {
      const error = 'Invalid launch date';
      const response = await request(app)
        .post('/v1/launches')
        .send(launchWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({ error });
    });
  });
});
