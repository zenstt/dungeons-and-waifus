"use strict";

var db = require('./db')


/**
 * @todo - Debería estar en una BBDD
 */
var char_list = {}

function moveChar(move, user, char) {
    if (char_list[user] && char_list[user][char]) {
        if (move == 0) { // Left
            char_list[user][char].position.x -= 1
        } else if (move == 1) { // Up
            char_list[user][char].position.y -= 1
        } else if (move == 2) { // Right
            char_list[user][char].position.x += 1
        } else if (move == 3) { // Down
            char_list[user][char].position.y += 1
        } else {
            return null;
        }
        return char_list[user][char];
    } else {
        return null;
    }
}

function isValidUser(user, pass, cb) {
    db.Find('users', { user: user, pass: pass }, { _id: 1 }, null, true, function (err, data) {
        if (err) return cb('Error on finding user', null);
        return cb(null, data);
    });
}


function getCharList(id, id_char) {
    if (char_list[id]) {
        if (id_char) {
            if (char_list[id][id_char]) {
                return char_list[id][id_char];
            }
        }
        let arr_return = [];
        for (let char_id in char_list[id]) {
            let char = char_list[id][char_id];
            arr_return.push(char);
        }
        return arr_return;
    } else {
        return null;
    }
}

function getCharListFromDb(id, id_char, cb) {
    let single = false;
    let query = { user: id }
    if (id_char) {
        single = true;
        query.id = id_char;
    }
    db.Find('chars', query, {}, null, single, function (err, data) {
        if (err) return cb('Error getting characters', null);
        return cb(null, data);
    });
}

function removeFromLocalList(char) {
    if (char_list[char.user]) {
        if (char_list[char.user][char.id]) {
            db.Update('chars', { user: char.user, id: char.id }, { $set: { position: char_list[char.user][char.id].position } }, true, function () {

            })
            delete char_list[char.user][char.id];

        }
        if (Object.keys(char_list[char.user]) == 0) {
            delete char_list[char.user];
        }
    }
}

function putInLocalList(char) {
    if (!char_list[char.user]) char_list[char.user] = {}
    char_list[char.user][char.id] = char;
}

function getRandomInt(min, max) {
    min = min || 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function findClientsSocket(io, roomId, namespace) {
    let res = []
    // the default namespace is "/"
    let ns = io.of(namespace || "/");
    if (ns) {
        for (var id in ns.connected) {
            if (roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId);
                if (index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

function createChar(user_id, char, cb) {
    db.Find('chars', { user: user_id }, { _id: 1 }, null, false, function (err, data) {
        if (err) return cb('Error creating character', null);
        let ID = data.length + 1;
        char.id = ID;
        db.Insert('chars', char, {}, function (err, data) {
            if (err) return cb('Error creating character', null);
            return cb(null, true);
        });
    });
}

function register(user_obj, cb) {
    db.Find('users', { user: user_obj.user }, { _id: 1 }, null, true, function (err, data) {
        if (err) return cb('Error creating account', null);
        if (data) return cb('User already in use', null);
        let user_insert = {
            email: user_obj.email,
            user: user_obj.user,
            pass: user_obj.pass,

            imagen: null
        }
        db.Insert('users', user_insert, null, function (err, data) {
            if (err) return cb('Error creating account', null);
            return cb(null, true);
        });
    });
}

function parseNumberCreation(number) {
    console.log('number: ', number);
    if (number.gender < 4 && number.race < 8 && number.class < 9) {
        let comp = {
            'gender': {
                "1": 'Male',
                "2": 'Female',
                "3": 'Apache Helicopter'
            },
            'race': {
                "1": 'Human',
                "2": 'Elf',
                "3": (number.gender == "1") ? 'Dwarf' : (number.gender == "2") ? 'Loli' : 'Tiny Helicopter',
                "4": 'Orc',
                "5": 'Troll',
                "6": 'Robot',
                "7": 'Murloc',
            },
            'class': {
                "1": "Warrior",
                "2": "Archer",
                "3": "Mage",
                "4": "Rogue",
                "5": "Necromancer",
                "6": "Furry",
                "7": "Waifu",
                "8": "Husbando",
            }
        }
        return {
            gender: comp.gender[number.gender],
            race: comp.race[number.race],
            class: comp.class[number.class]
        }
    } else {
        return null;
    }
}

module.exports = {
    isValidUser: isValidUser,
    getCharList: getCharList,
    getRandomInt: getRandomInt,
    moveChar: moveChar,
    findClientsSocket: findClientsSocket,
    register: register,
    getCharListFromDb: getCharListFromDb,
    putInLocalList: putInLocalList,
    removeFromLocalList: removeFromLocalList,
    createChar: createChar,
    parseNumberCreation: parseNumberCreation
}