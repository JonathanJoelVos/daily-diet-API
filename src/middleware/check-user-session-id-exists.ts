import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUserSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userSessionId = request.cookies.user_session_id
  console.log(userSessionId)
  if (!userSessionId) {
    return reply.status(401).send()
  }
}
