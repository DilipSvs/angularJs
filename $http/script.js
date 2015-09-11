(function () {
    'use strict';

    var app = angular.module('app', []).run(function () {
        console.log('app fired.');
    });

    app.factory('albumService', [
        '$http', '$q',
        function albumService($http, $q) {
            console.log('album service fired');

            // interface
            var service = {
                albums: [],                   
                getAlbums: getAlbums,
                getAlbumsSimple: getAlbumsSimple
            };
            return service;


            // implementation
            function getAlbums() {
                var def = $q.defer();

                $http.get("albums.js")
                    .success(function (data) {
                        service.albums = data;
                        def.resolve(data);
                        console.log('albums (simple) returned to controller.', data);
                    })
                    .error(function () {
                        def.reject("Failed to get albums");
                    });
                return def.promise;
            }

            // implementation
            function getAlbumsSimple() {
                return $http.get("albums.js")
                    .success(function (albums) {
                        service.albums = albums;
                    });
            }

     
        }
    ]);


    app.controller('albumsController', [
        '$scope', 'albumService',
        function albumsController($scope, albumService) {
            console.log('albumscontroller fired');
            var vm = this;
            vm.albums = [];
            vm.simpleMode = true;

            vm.getAlbums = function () {
                albumService.getAlbums()
                    .then(function (albums) {                        
                        for (var i = 0; i < albums.length; i++) {
                            albums[i].albumName += " (promise)";
                        }
                        vm.albums = albums;
                        console.log('albums (promises) returned to controller.', albums);
                    },
                    function () {
                        console.log('albums retrieval failed.');
                    });
            };

            vm.getAlbumsSimple = function () {
                albumService.getAlbumsSimple()
                    .success(function (albums) {                        
                        for (var i = 0; i < albums.length; i++) {
                            albums[i].albumName += " (simple)";
                        }
                        vm.albums = albums;
                        console.log('albums returned to controller.', vm.albums);
                    })
                    .error(function (http, status, fnc, httpObj) {
                        console.log('albums retrieval failed.', http, status, httpObj);
                    });
            };

            vm.toggleSimpleMode = function(mode) {                
                vm.simpleMode = mode;
                if (vm.simpleMode)
                    vm.getAlbumsSimple();
                else
                    vm.getAlbums();
            }

            if (vm.simpleMode)
                vm.getAlbumsSimple();
            else
                vm.getAlbums();
        }
    ]);
})();