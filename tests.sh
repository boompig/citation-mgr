#!/bin/bash

# NOTE to future self:
# I apologize for this
# this was meant as a quick and dirty way to make sure the server didn't crash when I visited these pages
# hopefully it will be easy for you to refactor into a proper test suite

SERVER='http://localhost:8080'
USERNAME='dan'

# test login / create account
curl -X POST "$SERVER/login" --data "{\"name\": \"$USERNAME\"}" -H 'Content-Type: application/json'
echo ""

# test GET refs
curl -X GET "$SERVER/refs"
echo ""
curl -X GET "$SERVER/refs?username=$USERNAME"
echo ""

# test GET topics
curl -X GET "$SERVER/topics"
echo ""
curl -X GET "$SERVER/topics?username=$USERNAME"
echo ""

# test POST topic
curl -X POST "$SERVER/topics" \
	--data "{\"name\": \"test-topic\", \"username\": \"$USERNAME\", \"description\": \"a sample topic\"}" \
	-H "Content-Type: application/json"
echo ""

# test DELETE topic
curl -X DELETE "$SERVER/topics/1"
echo ""

# test GET bows
curl -X GET "$SERVER/bow"
echo ""