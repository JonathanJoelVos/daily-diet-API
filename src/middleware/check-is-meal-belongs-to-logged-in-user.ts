import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export const paramsShemaMealId = z.object({
  mealId: z.string(),
})

export async function isMealBelongsToLoggedInUser(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { mealId } = paramsShemaMealId.parse(request.params)

  const meal = await knex('meals')
    .where({
      id: mealId,
    })
    .select()
    .first()

  if (!meal)
    return reply.status(404).send({
      error: 'Meal not found',
    })

  const userSessionId = request.cookies.user_session_id

  if (userSessionId !== meal?.user_id)
    return reply.status(401).send({
      error: 'Unathorized',
    })
}
