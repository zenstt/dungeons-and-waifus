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

    let socket = null;
    $scope.move = move;

    let char_id = $stateParams.char_id;
    let max = 15;

    let arr_map = [];

    let next = [];
    let char = null;

    $scope.$on("$destroy", function () {
        if (socket) {
            socket.disconnect();
        }
    });

    function startGame() {
        
        socket = io.connect('/', {
            query: {
                token: localStorage.getItem('token'),
                char: $stateParams.char_id
            }
        });

        socket.on('error', function (data) {
            alert(data);
            socket.disconnect();
            $state.go('char_list');
            return;
        });

        socket.on('some_move', function (data) {
            console.log('data: ', data);
            
            let found = false;
            if (data.chars) {
                for (let char of data.chars) {
                    for (let i = 0; i < next.length; i++) {
                        let index = next[i];
                        if (index.id == char.id) {
                            found = true;
                            next[i] = char;
                            break;
                        }
                    }
                    if (!found) {
                        next.push(char);
                    }
                }
            }
            if (data.dis) {
                for (let char of data.dis) {
                    for (let i = 0; i < next.length; i++) {
                        let index = next[i];
                        if (index.id == char.id) {
                            next.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            generateMap(char)
        })

        $(document).keyup(function (e) {
            let move = false;
            if (e.keyCode == 65 || e.keyCode == 37) {
                // a 65 // 37 <
                move = 0;
            } else if (e.keyCode == 87 || e.keyCode == 38) {
                // w 87 // 38 ^
                move = 1;
            } else if (e.keyCode == 68 || e.keyCode == 39) {
                // d 68 // 39 >
                move = 2;
            } else if (e.keyCode == 83 || e.keyCode == 40) {
                // s 83 // 40 v
                move = 3;
            }
            if (move | move === 0) {
                socket.emit('move', { move: move }, function (data_res) {
                    
                    if (data_res) {
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.data = data_res.char;
                            })
                            next = data_res.next;
                            char = data_res.char;
                            generateMap(data_res.char)
                        })
                    }
                });
            }

        })
    }

    function generateMap(charInfo) {
        arr_map = [];
        for (let i = 0; i < max; i++) {
            let topush = [];
            for (let j = 0; j < max; j++) {
                let x = (charInfo.position.x - 7 + j);
                let y = (charInfo.position.y - 7 + i);
                let id = x + '_' + y;
                if (j == 7 && i == 7) {
                    topush.push({ id: id, val: charInfo.name[0] });
                } else {
                    let found = null;
                    if (next) {
                        for (let char of next) {
                            if (char.position && char.position.x == x && char.position.y == y) {
                                found = char.name[0];
                                break;
                            }
                        }
                    }
                    topush.push({ id: id, val: found });
                }
            }
            arr_map.push(topush);
        }
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.map = arr_map;
            })
        })
    }

    default_petition('post', null, { req: 'enter_game', char_id: char_id }, function (data) {
        if (data) {
            
            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.data = data.data;
                    char = data.data;
                    generateMap(data.data);

                    startGame();
                })
            })
        } else {
            $state.go('char_list');
            return;
        }
    }, { http: $http });









    function move(event) {
        

    }

    

}