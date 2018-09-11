"use strict";

var scope = null;
var http = null;

/**
 * Función que hará una petición con los parámetros proporcionados a una url
 * @param {string} [type='get'] - 'get' o 'post': Tipo de petición http
 * @param {string} [url='/restricted'] - URL donde se hará la petición
 * @param {Object} [req={}] - Objeto para pasarle al servidor en la petición
 * @param {Function} cb - Función de callback donde devolverá false en caso de no dar nada (mostrará un alert antes) o la respuesta del servidor
 * @param {Object} [options={}] - Opciones adicionales de la función
 * @param {Object} [options.http] - Objeto http de angular para usarse en la petición
 */
function default_petition(type, url, req, cb, options) {
    options = options || {}
    type = type || 'get';
    url = url || '/restricted';
    req = req || {}
    if (type == 'get') {
        req = {
            headers: {
                token: localStorage.getItem('token')
            },
            params: req
        }
    } else {
        req.token = localStorage.getItem('token');
    }
    (options.http || http)[type](url, req).then(function (data) {
        if (data && data.data && data.data.status == 'ok') {
            cb(data.data);
        } else {
            alert(data.data.err)
            cb(false);
        }
    }, function () {
        cb(false);
    });
}

function logOff() {
    localStorage.removeItem('token');
    window.location = '/';
}