'use strict';

angular.module('appDoCFD')

.factory('crudFactory', ['$q', '$http', function( $q, $http ) {
    return new function() {

        this.getData = function( getJsonURL ) {
            var deferred = $q.defer();

            $http.get(getJsonURL ).
                success(function(data, status, headers, config) {
                    deferred.resolve(data);
                }).
                error(function(data, status, headers, config) {
                    deferred.reject([data,status,headers,config]);
                });

            return deferred.promise;
        }
		
		//Post Json record
		/*this.postData = function ( cfd ) {
			var request = $http({
				method: "post",
				url: "/api/EmployeesAPI",
				data:  Employee
			});
			return request;
		}*/

    };
}]);