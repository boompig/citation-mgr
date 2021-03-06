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
const createTableIfNotExists = async (tableName, createTableFn) => {
    const exists = await knex.schema.hasTable(tableName);
    if (!exists) {
        console.log(`Table ${tableName} does not exist, creating...`);
        await knex.schema.createTable(tableName, (table) => {
            return createTableFn(table);
        });
        console.log(`Created table ${tableName}`);
    }
};

// set up tables here
const usersTable = "users";
const User = bookshelf.Model.extend({
    tableName: usersTable,
    hasTimestamps: true,
});

/* old */

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

const locTable = "locations";
const Location = bookshelf.Model.extend({
    tableName: locTable,
    hasTimestamps: true,
});

const sectionsTable = "sections";
const Section = bookshelf.Model.extend({
    tableName: sectionsTable,
    hasTimestamps: true,
});

/* end old */

/* new */

const projectsTable = "projects";
const Project = bookshelf.Model.extend({
    tableName: projectsTable,
    hasTimestamps: true,
});

const pubsTable = "publications";
const Publication = bookshelf.Model.extend({
    tableName: pubsTable,
    hasTimestamps: true,
});

const quotesTable = "quotes";
const Quote = bookshelf.Model.extend({
    tableName: quotesTable,
    hasTimestamps: true,

    publication: function() {
        return this.belongsTo(Publication, "publication");
    }
});

/* end new */

const createTables = async () => {

    // test the connection
    try {
        await knex.raw("select 1+1 as result");
    } catch (e) {
        console.error("Fatal error: failed to connect to Postgres database");
        console.error(e);
        process.exit(1);
    }
    console.log("successfully connected to Postgres database");
    console.log("creating tables...");

    // create tables here
    await createTableIfNotExists(usersTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.string("email").unique().notNullable();
        table.string("hashed_password").notNullable();
        table.boolean("is_admin").notNullable().defaultTo(false);
        table.timestamps();
    });

    /* old */

    await createTableIfNotExists(topicsTable, (table) => {
        table.increments();
        table.string("name").unique().notNullable();
        table.string("description");
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    await createTableIfNotExists(bowTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    await createTableIfNotExists(sectionsTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.integer("section_number");
        table.integer("body_of_work")
            .notNullable()
            .references("id").inTable(bowTable).onDelete("cascade");
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    await createTableIfNotExists(refsTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.string("first_author");
        table.string("author_group");
        table.integer("year");
        table.integer("body_of_work")
            .references("id").inTable(bowTable).onDelete("cascade");
        table.integer("citation_num");
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    await createTableIfNotExists(locTable, (table) => {
        table.increments();
        table.integer("ref")
            .references("id").inTable(refsTable).onDelete("cascade");
        table.integer("section")
            .references("id").inTable(sectionsTable).onDelete("cascade");
        table.string("quote").notNullable();
        table.integer("body_of_work")
            .references("id").inTable(bowTable).onDelete("cascade");
        table.integer("topic")
            .references("id").inTable(topicsTable).onDelete("cascade");
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    /* end old */

    /* new */

    await createTableIfNotExists(projectsTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();

        table.unique(["name", "user"]);
    });

    await createTableIfNotExists(pubsTable, (table) => {
        table.increments();
        table.string("name").notNullable();
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.timestamps();
    });

    await createTableIfNotExists(quotesTable, (table) => {
        table.increments();

        // table.string("link");
        // table.string("authors");
        // table.date("source_pub_date");
        // table.string("publication_name");
        // table.string("source_title");

        // deliberately text instead of varchar
        table.text("quote").notNullable();
        table.integer("user")
            .notNullable()
            .references("id").inTable(usersTable).onDelete("cascade");
        table.integer("publication")
            .notNullable()
            .references("id").inTable(pubsTable).onDelete("cascade");
        table.integer("project")
            .notNullable()
            .references("id").inTable(projectsTable).onDelete("cascade");

        table.timestamps();
    });

    console.log("database setup complete");
};

// exports
module.exports = {
    conString: conString,
    knex: knex,
    User: User,
    Reference: Reference,
    BodyOfWork: BodyOfWork,
    Topic: Topic,
    Section: Section,
    Location: Location,
    Project: Project,
    Quote: Quote,
    Publication: Publication,
    createTables: createTables,
    tables: {
        users: usersTable,
        projects: projectsTable,
        publications: pubsTable,
        quotes: quotesTable,
    },
};
