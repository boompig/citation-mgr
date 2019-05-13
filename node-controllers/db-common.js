/**
 * Common utilities for database connection
 */

/* read postgres connection string from env variables if set
 * this is for Heroku */
const process = require("process");
const getDefaultConString = () => {
    const user = process.env["USER"];
    const host = "localhost";
    const database = "citation_manager";
    return `postgres://${user}@${host}/${database}`;
};

const defaultConString = getDefaultConString();
const conString = process.env.DATABASE_URL || defaultConString;

// imports
const knex = require("knex")({
    client: "pg",
    connection: conString
});
const bookshelf = require("bookshelf")(knex);

// utilities
const createTableIfNotExists = (tableName, createTableFn) => {
    knex.schema.hasTable(tableName)
        .then((exists) => {
            if (!exists) {
                console.log(`Table ${tableName} does not exist, creating...`);
                knex.schema.createTable(tableName, (table) => {
                    return createTableFn(table);
                }).then(() => {
                    console.log(`Created table ${tableName}`);
                });
            }
        });
};

// set up tables here
const usersTable = "users";
const User = bookshelf.Model.extend({
    tableName: usersTable,
    hasTimestamps: true
});

const bowTable = "bodies_of_work";
const BodyOfWork = bookshelf.Model.extend({
    tableName: bowTable,
    hasTimestamps: true,
});

const refsTable = "references";
const Reference = bookshelf.Model.extend({
    tableName: refsTable,
    hasTimestamps: true,
});

const topicsTable = "topics";
const Topic = bookshelf.Model.extend({
    tableName: topicsTable,
    hasTimestamps: true,
});

// create tables here
createTableIfNotExists(usersTable, (table) => {
    table.increments();
    table.string("name").unique().notNullable();
    table.boolean("is_admin").notNullable.defaultTo(false);
    table.timestamps();
});

createTableIfNotExists(topicsTable, (table) => {
    table.increments();
    table.string("name").unique().notNullable();
    table.string("description");

    table.string("username")
        .notNullable()
        .references("name").inTable(usersTable).onDelete("cascade");
    table.timestamps();
});

createTableIfNotExists(bowTable, (table) => {
    table.increments();
    table.string("name").unique().notNullable();
    table.timestamps();
});

createTableIfNotExists(refsTable, (table) => {
    table.increments();

    // primary characteristics of the table
    table.string("name").notNullable();
    table.string("first_author");
    table.string("author_group");
    table.integer("year");
    table.foreign("body_of_work").references("id").inTable(bowTable)
        .onDelete("cascade");
    table.integer("citation_num");

    table.string("username")
        .notNullable()
        .references("name").inTable(usersTable).onDelete("cascade");

    table.timestamps();
});


// exports
module.exports = {
    conString: conString,
    knex: knex,
    User: User,
    Reference: Reference,
    BodyOfWork: BodyOfWork,
    Topic: Topic,
};