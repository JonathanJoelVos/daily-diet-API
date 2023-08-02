/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import {
  isMealBelongsToLoggedInUser,
  paramsShemaMealId,
} from '../middleware/check-is-meal-belongs-to-logged-in-user'
import { checkUserSessionIdExists } from '../middleware/check-user-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/register/:userId',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        userId: z.string(),
      })

      const mealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        is_in_diet: z.boolean(),
        dateTime: z.string(),
      })

      const { userId } = paramsSchema.parse(request.params)
      const { name, description, is_in_diet, dateTime } = mealsBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        user_id: userId,
        date_time: dateTime,
        description,
        is_in_diet,
        name,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkUserSessionIdExists],
    },
    async (request) => {
      const { user_session_id } = request.cookies
      const meals = await knex('meals')
        .where({
          user_id: user_session_id,
        })
        .select()

      return {
        meals,
      }
    },
  )

  app.get(
    '/:mealId',
    {
      preHandler: [checkUserSessionIdExists, isMealBelongsToLoggedInUser],
    },
    async (request) => {
      const { mealId } = paramsShemaMealId.parse(request.params)

      const meal = await knex('meals')
        .where({
          id: mealId,
        })
        .select()
        .first()

      return meal
    },
  )

  app.delete(
    '/delete/:mealId',
    {
      preHandler: [checkUserSessionIdExists, isMealBelongsToLoggedInUser],
    },
    async (request, reply) => {
      const { mealId } = paramsShemaMealId.parse(request.params)

      await knex('meals')
        .where({
          id: mealId,
        })
        .del()

      return reply.status(200).send()
    },
  )

  app.put(
    '/:mealId',
    {
      preHandler: [checkUserSessionIdExists, isMealBelongsToLoggedInUser],
    },
    async (request, reply) => {
      const mealsBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        is_in_diet: z.boolean().optional(),
        dateTime: z.string().optional(),
      })

      const { mealId } = paramsShemaMealId.parse(request.params)

      const body = mealsBodySchema.parse(request.body)

      await knex('meals')
        .where({
          id: mealId,
        })
        .update({
          ...body,
        })

      return reply.status(201).send()
    },
  )
}
