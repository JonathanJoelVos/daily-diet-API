import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
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

  it('should be able to create meal', async () => {
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
      .send({
        name: 'teste',
        description: 'teste',
        is_in_diet: true,
        dateTime: 'teste',
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should be able to list all of the user meal', async () => {
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
      .send({
        name: 'teste',
        description: 'teste',
        is_in_diet: true,
        dateTime: 'teste',
      })
      .set('Cookie', cookies)
      .expect(201)

    const mealsRequest = await request(app.server)
      .get(`/meals/`)
      .set('Cookie', cookies)
      .expect(200)

    expect(mealsRequest.body).toEqual({
      meals: [
        expect.objectContaining({
          name: 'teste',
          description: 'teste',
          is_in_diet: 1,
          date_time: 'teste',
        }),
      ],
    })
  })

  it('should be able to list meal by id', async () => {
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
      .send({
        name: 'teste',
        description: 'teste',
        is_in_diet: true,
        dateTime: 'teste',
      })
      .set('Cookie', cookies)
      .expect(201)

    const userMeals = await request(app.server)
      .get(`/users/${userId}/meals`)
      .set('Cookie', cookies)
      .expect(200)

    const mealId = userMeals.body.meals[0].id

    const meal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(meal.body).toEqual(
      expect.objectContaining({
        name: 'teste',
        description: 'teste',
        is_in_diet: 1,
        date_time: 'teste',
      }),
    )
  })

  it('should be able to delete meal by id', async () => {
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
      .send({
        name: 'teste',
        description: 'teste',
        is_in_diet: true,
        dateTime: 'teste',
      })
      .set('Cookie', cookies)
      .expect(201)

    const userMeals = await request(app.server)
      .get(`/users/${userId}/meals`)
      .set('Cookie', cookies)
      .expect(200)

    const mealId = userMeals.body.meals[0].id

    await request(app.server)
      .delete(`/meals/delete/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should be able to update meal by id', async () => {
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
      .send({
        name: 'teste',
        description: 'teste',
        is_in_diet: true,
        dateTime: 'teste',
      })
      .set('Cookie', cookies)
      .expect(201)

    const userMeals = await request(app.server)
      .get(`/users/${userId}/meals`)
      .set('Cookie', cookies)
      .expect(200)

    const mealId = userMeals.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: 'feijao',
        description: 'feijao co arroz',
      })
      .set('Cookie', cookies)
      .expect(201)
  })
})
