"use strict";
if (!localStorage.getItem('token')) {
    location.href = exit_url;
}
var app = angular.module('dungeons_and_waifus_app', ['ui.router'])
    .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('char_list', {
                url: '/',
                templateUrl: 'templates/char_list.html',
                controller: 'char_list'
            })
            .state('play', {
                url: '/play',
                templateUrl: 'templates/play.html',
                params: {
                    char_id: null,
                },
                controller: 'play',
                onExit: function () {
                    $(document).off('keyup'); // Quitamos el evento al salir
                }
            })
        // $locationProvider.html5Mode(true).hashPrefix('!');
    })

app
    .controller('char_list', char_list_controller)      // Char list
    .controller('play', play_controller)      // play

function char_list_controller($scope, $http, $state) {

    $scope.playCharacter = playCharacter;


    function playCharacter(char) {
        $state.go('play', { char_id: char.id });
    }

    default_petition('get', null, { req: 'char_list' }, function (data) {
        if (data) {
            $scope.characters = data.data;
        }
    }, { http: $http });
}

function play_controller($scope, $http, $stateParams, $state) {
    if (!$stateParams.char_id) {
        $state.go('char_list');
        return;
    }

    $scope.move = move;

    $(document).keyup(function (e) {
        if (e.keyCode == 65 || e.keyCode == 37){
            // a 65
            // 37 <
            console.log('<')
        } else if (e.keyCode == 87 || e.keyCode == 38){
            // w 87
            // 38 ^
            console.log('^')
        } else if (e.keyCode == 68 || e.keyCode == 39){
            // d 68
            // 39 >
            console.log('>')
        } else if (e.keyCode == 83 || e.keyCode == 40){
            // s 83
            // 40 v
            console.log('v')
        }

    })


    let char_id = $stateParams.char_id;

    default_petition('post', null, { req: 'enter_game', char_id: char_id }, function (data) {
        if (data) {
            console.log('data: ', data);
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.data = data.data;
                })
            })
        } else {
            $state.go('char_list');
            return;
        }
    }, { http: $http });

    let max = 15;

    let arr_map = [];

    for (let i = 0; i < max; i++) {
        let topush = [];
        for (let j = 0; j < max; j++) {
            if (j == 7 && i == 7) {
                topush.push('@');
            } else {
                topush.push(null);
            }
        }
        arr_map.push(topush);
    }


    $scope.map = arr_map;


    function move(event) {
        console.log('event: ', event);

    }

    console.log('arr_map: ', arr_map);

}