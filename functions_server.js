"use strict";


/**
 * @todo - Debería estar en una BBDD
 */
var char_list = {
    admin: {
        32: {
            id: 32,
            name: 'Dañoncio',
            class: 'archer',
            level: 13,
            hp: 100,
            sp: 100,
            position: {
                x: null,
                y: null
            }
        },
        33: {
            id: 33,
            name: 'Harrrru',
            class: 'warro',
            level: 12,
            hp: 100,
            sp: 100,
            position: {
                x: null,
                y: null
            }
        },
        35: {
            id: 35,
            name: 'Lorenzon',
            class: 'warro',
            level: 12,
            hp: 100,
            sp: 100,
            position: {
                x: null,
                y: null
            }
        },
        36: {
            id: 36,
            name: 'Nelsront',
            class: 'warro',
            level: 12,
            hp: 100,
            sp: 100,
            position: {
                x: null,
                y: null
            }
        }
    }
}

function moveChar(move,user,char){
    if (char_list[user] && char_list[user][char]){
        if (move == 0){ // Left
            char_list[user][char].position.x -= 1
        } else if (move == 1){ // Up
            char_list[user][char].position.y -= 1
        } else if (move == 2){ // Right
            char_list[user][char].position.x += 1
        } else if (move == 3){ // Down
            char_list[user][char].position.y += 1
        } else {
            return null;
        }
        return char_list[user][char];
    } else {
        return null;
    }
}

function isValidUser(user, pass) {
    /** @todo Pedirlo a una BBDD */
    if (user == 'admin' && pass == 'admin') {
        return true;
    } else {
        return false;
    }
}


function getCharList(id, id_char) {
    /** @todo Pedirlo a una BBDD */
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


function getRandomInt(min, max) {
    min = min || 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function findClientsSocket(io,roomId, namespace) {
    let res = []
    // the default namespace is "/"
    let ns = io.of(namespace ||"/");
    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId);
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

module.exports = {
    isValidUser: isValidUser,
    getCharList: getCharList,
    getRandomInt: getRandomInt,
    moveChar:moveChar,
    findClientsSocket:findClientsSocket
}