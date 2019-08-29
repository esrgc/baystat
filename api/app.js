var express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')

var routes = require('./routes/index')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', routes)

module.exports = app;
