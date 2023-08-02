/* eslint-disable prettier/prettier */

import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.dateTime('date_time').notNullable();
        table.boolean('is_in_diet').notNullable();
        table.uuid('user_id').index().notNullable();
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('meals');
}
