"use strict";
var express = require("express");
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var moment = require('moment');
var app = express();
var server = require('http').Server(app);
var Lazy = require('lazy.js')

var io = require('socket.io')(server);


var port = process.env.PORT || 8080;


var func = require('./functions_server')

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static(__dirname + '/public'));


var SECRET = 'Its a secret';
var loggedUsers = {};

var max_x = 10;
var max_y = 10;


app.get('/', function (req, res) {
	res.render('index');
});

io.use(function (socket, next) {
	if (socket.handshake.query && socket.handshake.query.token && socket.handshake.query.char) {
		jwt.verify(socket.handshake.query.token, SECRET, function (err, decoded) {
			if (err) return next(new Error('Authentication error'));
			socket.user_data = decoded;
			socket.user_data.char = socket.handshake.query.char;
			next();
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
			// let users_selected = Lazy(arr_clients)
			// 	.filter(function (n) {
			// 		if (n.user_data.u == socket.user_data.u && n.user_data.char == socket.user_data.char) {
			// 			return false;
			// 		}
			// 		let char = func.getCharList(n.user_data.u, n.user_data.char);
			// 		if (
			// 			char.position.x > newChar.position.x - 8 &&
			// 			char.position.x < newChar.position.x + 8 &&
			// 			char.position.y > newChar.position.y - 8 &&
			// 			char.position.y < newChar.position.y + 8
			// 		) {
			// 			n.emit('some_move', { chars: [newChar] });
			// 			return true;
			// 		} else {
			// 			return false;
			// 		}
			// 	})
			// 	.map(function (n) {
			// 		let char = func.getCharList(n.user_data.u, n.user_data.char);
			// 		return char;
			// 	})
			// 	.toArray();
			// console.log(users_selected)
			fn({ char: newChar, next: users_selected });
		}
	})

	socket.on('disconnect', function () {
		console.log('User', socket.user_data.u, 'disconnected with char', socket.user_data.char);
		let arr_clients = func.findClientsSocket(io);
		let newChar = func.getCharList(socket.user_data.u, socket.user_data.char);
		let users_selected = getNearUsers(arr_clients, socket.user_data, newChar, true);
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
				let char_list = func.getCharList(req.user);
				return leaveOk(res, char_list)
			} else {
				return leave(res, 'Error getting user')
			}
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
				let char = func.getCharList(req.user, body.char_id)
				if (char) {
					if (!char.position || (!char.position.x && char.position.x !== 0) || (!char.position.y && char.position.y !== 0)) {
						char.position = {
							x: func.getRandomInt(0, max_x),
							y: func.getRandomInt(0, max_y)
						}
					}
					return leaveOk(res, char);
				} else {
					return leave(res, 'Cannot find character');
				}
			} else {
				return leave(res, 'Error getting character');
			}
		default:
			return leave(res, 'Ilegal petition');
	}

});




app.post('/register', (req, res) => {
	if (body.user && body.pass && body.email) {
		/** @todo */
	} else {
		return leave(res, 'Need user, password and email');
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
	// req.user = 'admin'
	// return next(); // Para saltarse las comprobaciones durante las pruebas...

	let token = req.body.token || req.headers.token || null;
	console.log('req.headers: ', req.headers);
	console.log('req.body: ', req.body);
	console.log("token:", token, typeof token)
	if (token && token) {
		let verifyTok = null;
		try {
			verifyTok = jwt.verify(token, SECRET);
		} catch (err) {
			console.log("err:", err)
			return leave(res, 'Error on token verification')
		}
		console.log('verifyTok: ', verifyTok);
		if (verifyTok && loggedUsers[verifyTok.u] && loggedUsers[verifyTok.u].t > moment().valueOf()) {
			loggedUsers[verifyTok.u].t = moment().add(48, 'hours').valueOf()
			req.user = verifyTok.u;
			next();
		} else {
			return leave(res, 'Session expired')
		}
	} else {
		return leave(res, 'Session expired')
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