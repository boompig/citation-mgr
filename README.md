citation-mgr
============

Citation Manager written in Node.js

## About

This is a citation manager written in Node.js. It is the source code accompanying the live app at http://citation-mgr.herokuapp.com/#/topics.
The idea behind this is that it is a simple interface to your Postgres database, where you manage citations. 
This takes care of the CRUD (Create, Read, Update, Delete) queries, making using it for managing citations clean and simple.
For complicated queries, drop down to postgres and write your own SQL.

## Organization

### Backend

The backend code is written in node.js and the main file is `server.js`.
The rest of the code can be found in `node-controllers` directory.
The database is assumed to be postgres, and most of the database schema and connection logic can be found in `node-controllers/db-common.js`.

### Frontend

The frontend is written using Angular (1). Routing on the frontend is done using angular routing and can be found in `public/js/app.js`.
The rest of the frontend code can be found in `public/js/angular-controllers`

## Run Locally

### Create local database fixtures

* currently, DB schema is not checked into the source. However you can read `node-controllers/db-common.js` for some of the schema.
* You can also request access to production Heroku DB, then `heroku pg:pull`

### Get web server locally

* git clone this repo
* cd into the directory where you cloned the repo and run `yarn install`
* from the same directory, run `yarn start`
* leave this terminal window running, server is running on port 8080

### Development

`nodemon`

### Testing

1. Set up the postgres database locally (unfortunately not mocked out)
2. `yarn test`
