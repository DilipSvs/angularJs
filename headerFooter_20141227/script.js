var myApp = angular.module('myApp', ['ui.router']);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['myApp']);
});

myApp.provider('myPageCtx', function() {
	
	var defaultCtx = {
		title: 'Default Title',
		headerUrl: 'default-header.tmpl.html',
		footerUrl: 'default-footer.tmpl.html'
	};

	var currentCtx = angular.copy( defaultCtx );
	
	return {
		$get: function( $rootScope ) { 

			// We probably want to revert back to the default whenever
			// the location is changed.

			$rootScope.$on( '$locationChangeStart', function() {
				angular.extend( currentCtx, defaultCtx );
			}); 

		return currentCtx; 
		}
	};

});

myApp.controller( 'MainCtrl', function( $scope, myPageCtx ) {
	$scope.username = "t";
	$scope.password = "t"
	$scope.pageCtx = myPageCtx;
});

myApp.controller( 'LoginCtrl', ['$scope', '$location',
	function( $scope, $location ) {
	$scope.login = function(){
		$location.path('/index');
	}
}]);

myApp.controller( 'View1Ctrl', function( $scope, myPageCtx ) {
	myPageCtx.title = 'Title set from view 1';
	myPageCtx.footerUrl = 'view1-footer.tmpl.html';
});

myApp.controller( 'View2Ctrl', function( $scope, myPageCtx ) {
	myPageCtx.headerUrl = 'view2-header.tmpl.html';
});

myApp.config(['$stateProvider','$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
	
		$urlRouterProvider.otherwise('/login');
		$urlRouterProvider.when('/index', '/index/view1');
		
		$stateProvider
            
			.state('login', {
				url:'/login',
				controller: 'LoginCtrl',
				templateUrl:'login.tmpl.html'                            
            })
			
			.state('index', {
				url:'/index',
				//controller: 'HomeCtrl',
				templateUrl:'index.tmpl.html'                            
            })
			
			.state('index.view1', {
				url:'/view1',
				controller: 'View1Ctrl',
				templateUrl:'view1.tmpl.html'                            
            })
			
			.state('index.head1', {
				url:'/head1',
				//controller: 'Head1Ctrl',
				templateUrl:'head1.tmpl.html'                            
            })
			
			.state('index.view2', {
				url:'/view2',
				controller: 'View2Ctrl',				
				templateUrl:'view2.tmpl.html'                            
            })
	}]);
