"use strict";


/**
 * @todo - Debería estar en una BBDD
 */
var char_list = {
    admin: {
        32: {
            id: 32,
            name: 'testiñoncio',
            class: 'archer',
            level: 13,
            hp: 100,
            sp: 100,
            position: {
                x: null,
                y: null
            }
        }
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

module.exports = {
    isValidUser: isValidUser,
    getCharList: getCharList,
    getRandomInt: getRandomInt
}