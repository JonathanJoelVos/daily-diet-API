import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe.skip('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  it('should be able to create user profile', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'jojo',
        email: 'jojotest@test',
      })
      .expect(201)
  })

  it('should be able to perform a successful user login', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'jojo',
        email: 'jojotest@test',
      })
      .expect(201)

    await request(app.server)
      .post('/users/login')
      .send({
        email: 'jojotest@test',
      })
      .expect(201)
  })

  it('should be able to delete the user profile', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'jojo',
        email: 'jojotest@test',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/users/login')
      .send({
        email: 'jojotest@test',
      })
      .expect(201)

    const userId = loginResponse.body.id
    const cookies = loginResponse.get('Set-cookie')

    await request(app.server)
      .delete(`/users/delete/${userId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it("should be able to view the logged-in user's metrics", async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'jojo',
        email: 'jojotest@test',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/users/login')
      .send({
        email: 'jojotest@test',
      })
      .expect(201)

    const userId = loginResponse.body.id
    const cookies = loginResponse.get('Set-cookie')

    const userMetrics = await request(app.server)
      .get(`/users/${userId}/metrics`)
      .set('Cookie', cookies)
      .expect(200)

    expect(userMetrics.body).toEqual({
      totalRegisteredMeals: 0,
      totalMealsInDiet: 0,
      totalMealsOutOfDiet: 0,
      bestSequence: 0,
    })
  })

  it('should be able to list all of the user`s meal', async () => {
    const mockMeal = {
      name: 'teste',
      description: 'teste',
      is_in_diet: false,
      dateTime: 'teste',
    }

    await request(app.server)
      .post('/users')
      .send({
        name: 'jojo',
        email: 'jojotest@test',
      })
      .expect(201)

    const loginResponse = await request(app.server)
      .post('/users/login')
      .send({
        email: 'jojotest@test',
      })
      .expect(201)

    const userId = loginResponse.body.id
    const cookies = loginResponse.get('Set-cookie')

    await request(app.server)
      .post(`/meals/register/${userId}`)
      .send(mockMeal)
      .set('Cookie', cookies)
      .expect(201)

    const userMeals = await request(app.server)
      .get(`/users/${userId}/meals`)
      .set('Cookie', cookies)
      .expect(200)

    expect(userMeals.body).toEqual({
      meals: [
        expect.objectContaining({
          is_in_diet: 0,
          name: 'teste',
          description: 'teste',
          date_time: 'teste',
        }),
      ],
    })
  })
})
