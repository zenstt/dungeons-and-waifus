"use strict";
var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();
var server = require('http').Server(app);
var Lazy = require('lazy.js');

var io = require('socket.io')(server);

var func = require('./functions_server')
var DB = require('./db')
var conf = require('./config')

var port = process.env.PORT || 8080;


app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));


var loggedUsers = {};

var max_x = 10;
var max_y = 10;

DB.Connect(conf.mongo_url, function () {
	server.listen(port, function () {
		console.log('Server Started on port ' + port)
	});
})


app.get('/', function (req, res) {
	res.render('index');
});

io.use(function (socket, next) {
	if (socket.handshake.query && socket.handshake.query.token && socket.handshake.query.char) {
		jwt.verify(socket.handshake.query.token, conf.TOKEN_KEY, function (err, decoded) {
			if (err) return next(new Error('Authentication error'));
			if (decoded && loggedUsers[decoded.u] && loggedUsers[decoded.u].t > moment().valueOf()) {
				loggedUsers[decoded.u].t = moment().add(48, 'hours').valueOf()
				socket.user_data = decoded;
				socket.user_data.char = socket.handshake.query.char;
				next();
			} else {
				next(new Error('Session expired'));
			}
		});
	} else {
		next(new Error('Authentication error'));
	}
})
function getNearUsers(arr_clients, user_data, newChar, disconnect) {
	return Lazy(arr_clients)
		.filter(function (n) {
			if (n.user_data.u == user_data.u && n.user_data.char == user_data.char) {
				return false;
			}
			let char = func.getCharList(n.user_data.u, n.user_data.char);
			if (
				char.position.x > newChar.position.x - 9 &&
				char.position.x < newChar.position.x + 9 &&
				char.position.y > newChar.position.y - 9 &&
				char.position.y < newChar.position.y + 9
			) {
				if (disconnect) {
					n.emit('some_move', { dis: [newChar] });
				} else {
					n.emit('some_move', { chars: [newChar] });
				}
				return true;
			} else {
				return false;
			}
		})
		.map(function (n) {
			let char = func.getCharList(n.user_data.u, n.user_data.char);
			return char;
		})
		.toArray();
}
io.on('connection', function (socket) {
	console.log('User connected to game:', socket.user_data.u, ' with char:', socket.user_data.char);


	// let clients = io.sockets.clients(); 			// Lista de todos los sockets conectados actualmente
	// socket.emit('id',{val:"val"}) 				// Emite al usuario (El del socket)
	// socket.broadcast.emit('id',{val:"val"}) 		// Emite a todos los usuarios excepto el emisor
	// io.sockets.emit('id', {val:"val"});			// Emite a todos los usuarios

	// socket.join('some room') 					// Añade el socket a una sala
	// socket.to('some room').emit({val:"val"})		// Emite a todos los usuarios de una sala excepto el emisor
	// io.to('some room').emit({val:"val"}); 		// Emite a todos los usuarios de una sala
	// socket.leave("some room")					// Elimina a un socket de una sala

	// io.to(socketId).emit('id', {val:"val"}); 	// Emite a un socket en concreto

	// socket.on('id',function(data,fc){ 			// Recibe emit del cliente a 'id'
	// 	// data = Información emitida por el cliente
	// 	// fc 	= Respuesta del servidor ( fn({val:'val'}); )
	// });




	let arr_clients = func.findClientsSocket(io);
	let newChar = func.getCharList(socket.user_data.u, socket.user_data.char);
	let users_selected = getNearUsers(arr_clients, socket.user_data, newChar);

	console.log(users_selected)
	socket.emit('some_move', { chars: users_selected });

	socket.on('move', function (data, fn) {
		if (data.move || data.move === 0) {
			let arr_clients = func.findClientsSocket(io);
			let newChar = func.moveChar(data.move, socket.user_data.u, socket.user_data.char);
			let users_selected = getNearUsers(arr_clients, socket.user_data, newChar);
			fn({ char: newChar, next: users_selected });
		}
	})

	socket.on('disconnect', function () {
		console.log('User', socket.user_data.u, 'disconnected with char', socket.user_data.char);
		let arr_clients = func.findClientsSocket(io);
		let newChar = func.getCharList(socket.user_data.u, socket.user_data.char);
		getNearUsers(arr_clients, socket.user_data, newChar, true);
		func.removeFromLocalList(newChar);
	});
});

app.get('/restricted', middleWareToken, (req, res) => {
	let body = req.query;
	if (!body.req) {
		console.log(req.user, "Ha enviado una petición GET a '/restricted, pero no tenía body.req", body);
		return leave(res, 'Malformed petition');
	}
	console.log(req.user, "pidiendo GET en '/restricted", body.req);
	switch (body.req) {
		case 'char_list':
			if (req.user) {
				func.getCharListFromDb(req.user, null, function (err, char_list) {
					console.log(char_list);
					if (err) return leave(res, err);
					return leaveOk(res, char_list)
				});
			} else {
				return leave(res, 'Error getting user')
			}
			break;
		default:
			return leave(res, 'Ilegal petition');
	}
});

app.post('/restricted', middleWareToken, (req, res) => {
	let body = req.body;
	if (!body.req) {
		console.log(req.user, "Ha enviado una petición GET a '/restricted, pero no tenía body.req", body);
		return leave(res, 'Malformed petition');
	}
	console.log(req.user, "pidiendo GET en '/restricted", body.req);
	switch (body.req) {
		case 'enter_game':
			if (body.char_id && req.user) {
				func.getCharListFromDb(req.user, body.char_id, function (err, char) {
					if (err) return leave(res, err);
					if (char) {
						if (!char.position || (!char.position.x && char.position.x !== 0) || (!char.position.y && char.position.y !== 0)) {
							char.position = {
								x: func.getRandomInt(0, max_x),
								y: func.getRandomInt(0, max_y)
							}
						}
						func.putInLocalList(char);
						return leaveOk(res, char);
					} else {
						return leave(res, 'Cannot find character');
					}

				})
			} else {
				return leave(res, 'Error getting character');
			}
			break;
		case 'create_char':
			if (body.char.name && body.char.gender && body.char.race && body.char.class) {
				let parsed = func.parseNumberCreation(body.char);
				console.log('parsed: ', parsed);
				if (!parsed || !parsed.gender || !parsed.race || !parsed.class) {
					return leave(res, 'Character not valid');
				}
				let char_creation = {
					user: req.user,
					name: body.char.name,
					gender: parsed.gender,
					race: parsed.race,
					class: parsed.class,
					level: 1,
					hp: 100,
					sp: 100,
					position: {
						x: 0,
						y: 0
					},
					picture: null
				}
				func.createChar(req.user, char_creation, function (err, status) {
					if (err) return leave(res, err);
					return leaveOk(res, null);
				})
			} else {
				return leave(res, 'Insuficients params')
			}
			break;
		default:
			return leave(res, 'Ilegal petition');
	}

});




app.post('/register', (req, res) => {
	let body = req.body;
	console.log("Se ha enviado una petición de registro con body", body);
	if (body.user && body.pass && body.email) {
		func.register({ user: body.user, pass: body.pass, email: body.email }, function (err, data) {
			if (err) return leave(res, err);
			return leaveOk(res, null);
		});
	} else {
		return leave(res, 'Need user, password and email');
	}
});



app.post('/logIn', (req, res) => {
	let body = req.body;
	console.log("Alguien tratando de hacer logIn con", body);
	if (body && body.user && body.pass) {
		func.isValidUser(body.user, body.pass, function (err, data) {
			console.log('data: ', data);
			if (err) return leave(res, err);
			if (data) {
				let tokenNew = jwt.sign({ u: body.user, t: moment().valueOf() }, conf.TOKEN_KEY);
				loggedUsers[body.user] = {
					u: body.user,
					tok: tokenNew,
					t: moment().add(48, 'hours').valueOf()
				}
				return leaveOk(res, { token: tokenNew });
			} else {
				return leave(res, 'Wrong user or password')
			}
		});
	} else {
		return leave(res, 'No user or password sent');
	}
});

function middleWareToken(req, res, next) {
	// req.user = 'admin'
	// return next(); // Para saltarse las comprobaciones durante las pruebas...

	let token = req.body.token || req.headers.token || null;
	if (token && token) {
		let verifyTok = null;
		try {
			verifyTok = jwt.verify(token, conf.TOKEN_KEY);
		} catch (err) {
			console.log("err:", err)
			return leave(res, 'Error on token verification')
		}
		if (verifyTok && loggedUsers[verifyTok.u] && loggedUsers[verifyTok.u].t > moment().valueOf()) {
			loggedUsers[verifyTok.u].t = moment().add(48, 'hours').valueOf()
			req.user = verifyTok.u;
			next();
		} else {
			return leave(res, 'Session expired');
		}
	} else {
		return leave(res, 'Session expired');
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