citation-mgr
============

Citation Manager written in Node.js

## About

This is a citation manager written in Node.js. It is the source code accompanying the live app at http://citation-mgr.herokuapp.com/#/topics.
The idea behind this is that it is a simple interface to your Postgres database, where you manage citations. 
This takes care of the CRUD (Create, Read, Update, Delete) queries, making using it for managing citations clean and simple.
For complicated queries, drop down to postgres and write your own SQL.

## Run Locally

### Create local database fixtures

* currently, DB schema is not checked into the source
* have to request access to production Heroku DB, then `heroku pg:pull`

### Get web server locally

* git clone this repo
* cd into the directory where you cloned the repo and run `npm install`
* from the same directory, run `npm start`
* leave this terminal window running, server is running on port 8080
