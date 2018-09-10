"use strict";

function isValidUser(user, pass) {
    if (user == 'admin' && pass == 'admin') {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    isValidUser: isValidUser,
}