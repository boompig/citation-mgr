Citation Manager
============

Easily manage citations and quotes in research projects

## About

This is the source code accompanying the live app at https://citation-mgr.herokuapp.com/.
Think of it as Evernote but for citations and quotes in research projects.

## Organization

### Backend

The backend code is written in node.js and the main file is `server.js`.
The rest of the code can be found in `node-controllers` directory.
The database is assumed to be postgres, and most of the database schema and connection logic can be found in `node-controllers/db-common.js`.

### Frontend

The frontend is written using Vue.js. Front end routes can be found in `server.js`.
The rest of the frontend code can be found in `public/js/vue-components`

## Run Locally

### Create local database fixtures

* Database fixtures will be automatically created when you start the server
  * Edit settings in `node-controllers/db-common.js`

### Get web server locally

* git clone this repo
* `cd` into the directory where you cloned the repo and run `yarn install`
* from the same directory, run `yarn start`
* leave this terminal window running, server is running on port 8080
  * you can set the port using the PORT environment variable

### Development

`nodemon`

### Testing

1. Set up the Postgres database locally (unfortunately not mocked out)
2. `yarn lint`
3. `yarn test`

#### Database Setup

See file `node-controllers/db-common.js`
