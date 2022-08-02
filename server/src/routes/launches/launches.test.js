const request = require('supertest');
const app = require('../../app');

describe('Test Get /launches', () => {
   test('It should respond with 200 success', async () => {
    const response = await request(app).get('/launches')
        .expect('Content-Type', /json/)
        .expect(200);
   });
});

describe('Test POST /launch', () => {
    const launchDate = new Date('January 4, 2028').toISOString();

    mission = {
        mission: 'USS Enterprise',
        rocket: 'NC 1701-D',
        target: 'Kepler 186 f',
        launchDate: launchDate
    }

    missionMissingData = {
        mission: 'USS Enterprise',
        rocket: 'NC 1701-D',
        target: 'Kepler 186 f', 
    }

    missionInvalidDate = {
        mission: 'USS Enterprise',
        rocket: 'NC 1701-D',
        target: 'Kepler 186 f',
        launchDate: "BobJones"
    }

    test('It should respond with 201 success', async () => {
      
        const response = await request(app)
            .post('/launches')
            .send(mission)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(response.body).toMatchObject(mission);
    });


    test('It should catch missing required properties', async () => {
        const response = await request(app)
        .post('/launches')
        .send(missionMissingData)
        .expect('Content-Type', /json/)
        .expect(400);

        expect(response.body).toStrictEqual({error: 'Missing required launch property'});
    });


    test('It should catch invalid dates', async () => {
        const response = await request(app)
        .post('/launches')
        .send(missionInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

        expect(response.body).toStrictEqual({error: 'Invalid Date'});
    });
});