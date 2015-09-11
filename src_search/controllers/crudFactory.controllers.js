'use strict';

angular.module('appDoCFD')

    .controller('crudFactoryCtrl', ['$scope', 'crudFactory', function( $scope, crudFactory ) {

        $scope.getJsonData = function( jsonFilePath ) {
            crudFactory.getData( jsonFilePath ).then( function( data ) {
                $scope.masterData = data;
            });
        };

    }])
	