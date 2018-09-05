"use strict";
var express = require("express");

var app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 8080;
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('index');
});

server.listen(port, function() {
	console.log('Server Started on port ' + port)
});