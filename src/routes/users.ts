import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkUserSessionIdExists } from '../middleware/check-user-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async () => {
      const users = await knex('users').select()

      return { users }
    },
  )

  app.get('/:userId/meals', async (request) => {
    const paramsSchema = z.object({
      userId: z.string(),
    })

    const { userId } = paramsSchema.parse(request.params)

    const meals = await knex('meals')
      .where({
        user_id: userId,
      })
      .select()

    return { meals }
  })

  app.get(
    '/:userId/metrics',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (request) => {
      const paramsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = paramsSchema.parse(request.params)

      const meals = await knex('meals').where({
        user_id: userId,
      })

      const { totalMealsInDiet, totalMealsOutOfDiet } = meals.reduce(
        (prevValue, currentValue) => {
          if (currentValue.is_in_diet) {
            prevValue.totalMealsInDiet += 1
          } else {
            prevValue.totalMealsOutOfDiet += 1
          }

          return prevValue
        },
        {
          totalMealsInDiet: 0,
          totalMealsOutOfDiet: 0,
        },
      )

      let bestSequence = 0
      let currentSequence = 0

      meals.forEach((meal) => {
        if (meal.is_in_diet) {
          currentSequence += 1

          if (currentSequence > bestSequence) {
            bestSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      })

      return {
        totalRegisteredMeals: meals.length,
        totalMealsInDiet,
        totalMealsOutOfDiet,
        bestSequence,
      }
    },
  )

  app.post('/login', async (request, reply) => {
    const loginBodySchema = z.object({
      email: z.string(),
    })

    const { email } = loginBodySchema.parse(request.body)

    const user = await knex('users')
      .where({
        email,
      })
      .select()
      .first()

    if (user?.id) {
      console.log(user?.id)
      reply.cookie('user_session_id', user?.id, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return reply.status(201).send(user)
  })

  app.post('/', async (request, reply) => {
    const userId = randomUUID()
    const usersBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = usersBodySchema.parse(request.body)

    const userSessionId = request.cookies.user_session_id
    if (!userSessionId) {
      reply.cookie('user_session_id', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: userId,
      name,
      email,
    })

    return reply.status(201).send()
  })

  app.delete(
    '/delete/:userId',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = paramsSchema.parse(request.params)

      await knex('users').where({ id: userId }).del()

      return reply.status(200).send()
    },
  )
}
