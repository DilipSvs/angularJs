'use strict';

angular.module('appDoCFD')

    .controller('searchCtrl', ['$scope', '$filter',
		function( $scope, $filter ) {
		$scope.isSearchOptionCollapsed = true;
		$scope.isResultOptionCollapsed = true;
		$scope.toshow = false;
		
		$scope.searchAll = function( ){
			var s = $scope.jsonSearch;
			$scope.toshow = true;
			//storing selected search option in json format as name:value pair
			var searchJson1 = "";
			angular.forEach ( s, function ( item ) {
				//console.log( item.value );
				if( item.value != "" ) {
					searchJson1 += '"' + item.name + '":"' + item.value +'",';					
				}
			});
			var searchJson = "{" + searchJson1.substring(0, searchJson1.length-1) + "}";
			//post data
			console.log( searchJson )
			//$scope.$emit('someEvent', [1,2,3]);
			$scope.$emit( 'searchResult', searchJson );
			
		};
		
		//
		$scope.$watch( "jsonSearch" , function(n,o){
			var trues = $filter("filter")( n , {selected:true} );
			$scope.chkSearchSelected = trues.length;
		}, true );
		//
		$scope.$watch( "jsonResult" , function(n,o){
			var trues = $filter("filter")( n , {selected:true} );
			$scope.chkTableSelected = trues.length;
		}, true );		
		
	}])
	