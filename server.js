"use strict";
var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();
var server = require('http').Server(app);

var port = process.env.PORT || 8080;


var func = require('./functions_server')

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));


var SECRET = 'Its a secret';
var loggedUsers = {};

app.get('/', function (req, res) {
	res.render('index');
});
app.post('/register', (req, res) => {
	if (body.user && body.pass && body.email) {

	} else {
		return leave(res, 'Se necesita usuario, contraseña y Email');
	}
});
app.post('/logIn', (req, res) => {
	let body = req.body;
	console.log("Alguien tratando de hacer logIn con", body);
	if (body && body.user && body.pass) {
		if (func.isValidUser(body.user, body.pass)) {
			let tokenNew = jwt.sign({ u: body.user, t: moment().valueOf() }, SECRET);
			loggedUsers[body.user] = {
				u: body.user,
				tok: tokenNew,
				t: moment().add(48, 'hours').valueOf()
			}
			return leaveOk(res, { token: tokenNew });
		} else {
			return leave(res, 'Incorrect user or password');
		}
	} else {
		return leave(res, 'No user or password sent');
	}
});

function middleWareToken(req, res, next) {
	return next(); // Para saltarse las comprobaciones durante las pruebas...
	let token = req.body.token || req.headers.token || null;
	if (token) {
		let verifyTok = null;
		try {
			verifyTok = jwt.verify(token, SECRET);
		} catch (err) {
			console.log("Error al verificar el token", err);
			return leave(res, 'Error al verificar la sesión')
		}
		if (verifyTok && loggedUsers[verifyTok.u] && loggedUsers[verifyTok.u].t > moment().valueOf()) {
			loggedUsers[verifyTok.u].t = moment().add(48, 'hours').valueOf()
			req.user = verifyTok.u;
			next();
		} else {
			return leave(res, 'Sesión caducada')
		}
	} else {
		return leave(res, 'Sesión caducada')
	}
}

function leave(res, err) {
	res.send({ status: 'err', err: err || 'Faltan parámetros' });
	res.end();
}
function leaveOk(res, data) {
	res.send({ status: 'ok', data: data || null });
	res.end();
}

server.listen(port, function () {
	console.log('Server Started on port ' + port)
});