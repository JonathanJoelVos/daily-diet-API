// eslint-disable-next-line
import knex from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    users: {
      id: string
      name: string
      email: string
    }
    meals: {
      id: string
      name: string
      description: string
      date_time: string
      is_in_diet: boolean
      user_id: string
    }
  }
}
