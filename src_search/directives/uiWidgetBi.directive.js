 'use strict';

var app = angular.module( 'appDoCFD' )

app.directive( "uiWidgetBi", function( crudFactory ) {
	var master;
	return {
		name: 'widget',
		restrict: "E",
		link:function( $scope, $element, $attrs ){
			$scope.getContentUrl = function() {
				return $attrs.urlfordisplay;
				//return 'views/navigation/search.html';
			}
		},
		scope: {
			masterJsonFilePath: "@"
		},
		//templateUrl: 'views/navigation/search.html',
		template: '<div ng-include="getContentUrl()"></div>',
		controller: function( $scope, $element, $attrs, $transclude, $filter ) {
			//
			var selectedEntityObj = [];
			$scope.nameListDataCollapse = [];
			
			//click on change button
			$scope.change = function(){
				resultDataMapping();
			}
			
			//click on get button
			$scope.get = function(){
				storeSelectedValue();
			}
			
			//get entity type for displaying search
			function getEntityType(){
				return "volumegriddata";
			}
			
			//get master data for the selected entity
			function getMasterDataWithEntity( entityType ){
				return $scope.masterData[0][entityType];
			}				
			
			//
			function findObjectBlock(object,elementKey,elementValue) {
				if(object.hasOwnProperty( elementKey ) && object[elementKey]== elementValue  ){
					return object;
				}
				for(var i=0;i<Object.keys(object).length;i++){
					if(typeof object[Object.keys(object)[i]]=="object" && object[Object.keys(object)[i]]!=null){
						var o = findObjectBlock(object[Object.keys(object)[i]], elementKey, elementValue);
						if(o != null)
							return o;
					}
				}
				return null;
			};
			
			//result dataMapping
			function resultDataMapping(){
				//var volumegriddata = 'volumegriddata';				
				//$scope.searchEntity = $scope.masterData[0][volumegriddata];
				var entityType = getEntityType();
				$scope.searchEntity = getMasterDataWithEntity( entityType );
				
				var global = [];
				
				for( var j=0; j<$scope.searchEntity.length; j++ ){
					var element = [];
					var globalChild = [];
					
					for( var i=0; i<$scope.searchEntity[j].Name_List.length; i++){
						var objChild = {
							name: $scope.searchEntity[j].Name_List[i],
							value: '',
							selected: false
						}
						globalChild.push( objChild );
					}
					//console.log( globalChild );
					
					angular.forEach($scope.jsonResult, function(value, key) {
						var val = $scope.searchEntity[j][value.name]
						//console.log( j+"  :  "+value.name +"      : "+ val+"        "+value.selected);
						var obj = {
							name: value.name,
							value: val,
							selected: value.selected
						}
						element.push( obj );
					})
					element.imgUrl = "assets/img/details_open.png"
					element.child = globalChild;
					global.push ( element );
				}
					
				$scope.global = global;
				//console.log( global[0] );
			}
			
			//search dataMapping
			function searchDataMapping(){
				var searchEntity = findObjectBlock( $scope.searchConfigJson, "EntityType", "VolumeGrid" ),
				searchParamList = searchEntity.Config.SearchParamList,
				resultList = searchEntity.Config.ResultList;
				
				$scope.jsonSearch = makeCheckboxEnable( searchParamList, 4 );				
				$scope.jsonResult = makeCheckboxEnable( resultList, 7 );
			}
			
			//child tree display
			function childCollapseFn(){
				$scope.dDataCollapseFn = function () {
					$scope.nameListDataCollapse = [];
					for (var i = 0; i < $scope.searchEntity.length; i++ ) {
						$scope.nameListDataCollapse.push(false);
					}
				};
				
				//
				$scope.selectTableRow = function ( index ){
					if (typeof $scope.nameListDataCollapse === 'undefined') {
						$scope.dDataCollapseFn();
					}
					
					//toggle images +/-
					if( $scope.global[index].imgUrl == "assets/img/details_open.png" ) {
						$scope.nameListDataCollapse[index] = true;
						$scope.global[index].imgUrl = "assets/img/details_close.png";
					} else {
						$scope.nameListDataCollapse[index] = false;
						$scope.global[index].imgUrl = "assets/img/details_open.png"
					}
				}
				
				//check all 
				$scope.checkAll = function ( index ) {
					var v = $scope.searchEntity[index];
					var k = $scope.global[index].child;
				
					if ( !v.selectedAll ) {
						v.selectedAll = true;
					} else {
						v.selectedAll = false;
					}
										
					angular.forEach( k, function (item) {						
						item.selected = v.selectedAll;
					});
				}
				
				//check for parent checkbox value
				$scope.allNeedsMet = function ( index ) {
					var v = $scope.searchEntity[index];
					var k = $scope.global[index].child;					
					
					var needsMet = k.reduce( function (memo, vg) {
						return memo + (vg.selected ? 1 : 0);
					}, 0);

					v.selectedAll = (needsMet === k.length); 
					return (needsMet === k.length);
				};
			}
			
			//
			function storeSelectedValue (){
				var singleEntityBlock = {i:"",selected:true}; //obj used for checking single / multiple block selected
					
				for ( var i = 0; i < $scope.global.length; i++ ) {
					var arr = [];
					for( var j = 0; j < $scope.global[i].child.length; j++ ) {
						//console.log( $scope.global[i].child[j].selected )
						if( $scope.global[i].child[j].selected ) {
							
							/*if( singleEntityBlock.i != i && singleEntityBlock.selected){
								console.log( "multiple block selected")
							}*/
							//
							singleEntityBlock.i = i;
							singleEntityBlock.selectedFlag = true;
							//storing the value to update appJson
							arr.push( {j:j, name:$scope.global[i].child[j].name} );
						}//if
					}//j
					
					if( arr.length > 0 ) {
						var o = {};
						o.i = i;
						o.arr = arr;
						o.url = findObjectBlock( $scope.global[i], "name", "URL" ).value;
						selectedEntityObj.push( o );
					}// if
				}//i
				
				if( selectedEntityObj.length == 0 ) {
					console.log("Please select a block")
				}
				else if( selectedEntityObj.length == 1 ) {
					//console.log( selectedEntityObj )
					callResultGetGrid();
				} else {
					console.log( "multiple block selected");
				}
			}
			
			//render resultJSON after clicking GET
			function updateResultJson( ){
				//update URL
				//var a = findObjectBlock( $scope.resultGetGrid, "Mask", "4444" );
				var getConfig = $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config;
				getConfig.URL.Value = selectedEntityObj[0].url;
				
				//update BaseDir
				//"get BaseDir Value from transaction JSON and update appJson"
				getConfig.BaseDir.Value = "/boeing/codeGen/sample"
				//console.log( $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config.GridList.Value[1].Pattern );
				
				//update Pattern
				//reset Pattern
				getConfig.GridList.Value[0] = [];
				//console.log( $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config.GridList.Value[0].length )
				for( var i = 0; i < selectedEntityObj[0].arr.length; i++ ){
					var getListValue = getConfig.GridList.Value[0];
					
					getConfig.GridList.Value[0].push( getConfig.GridList.Value[1].Pattern );
										
					getConfig.GridList.Value[0][i].GridSpec.DataBlockFilename.Value = selectedEntityObj[0].arr[i].name;
					//console.log( $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config.GridList.Value[0] );	
										
					//update Required value to TRUE
					getConfig.GridList.Value[0][i].GridSpec.Required.Value = true;
				}
				
				uploadData()
			}
			
			function uploadData(){
				console.log( $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config.GridList.Value[0].length )
				for( var i = 0; i < selectedEntityObj[0].arr.length; i++ ){
				//console.log( i )
				console.log( $scope.getGrid.Template[1].TemplateApplications[0].GetGrid.DataBlocks[0].config.GridList.Value[0][i].GridSpec.DataBlockFilename );
				}
			}
			//fill json with required data
			function makeCheckboxEnable( searchParamList, searchParamDefault ){
				var a = [];
				angular.forEach( searchParamList , function( value, key ) {
					var obj = {
						name:value.Name,
						value:"",
						selected: key >= searchParamDefault ? false : true
					};
					a.push(obj)
				});
				return a;
			}
			
			//CRUD for getting masterdata
			//for checking locally
			//comment getData method when working in server			
			crudFactory.getData( $attrs.masterjsonfilepath ).then( function( data ) {
				$scope.masterData = data;
            });
			
			//CRUD for getting configuration details
			crudFactory.getData( $attrs.searchconfigjsonfilepath ).then( function( data ) {
				$scope.searchConfigJson = data;
				searchDataMapping();
            });
			
			//CRUD for getting app.json
			crudFactory.getData( $attrs.getgrid ).then( function( data ) {
					$scope.getGrid = data;
					searchJsonString ( data, 'GetGrid');
					//console.log( 'getGrid' )
					//console.log( data )
				});
			
			function searchJsonString( jsonObj, searchText ){
				var index = 0;
				var found;
				var entry;
				console.log( jsonObj )
				for (index = 0; index < jsonObj.length; ++index) {
					entry = jsonObj[index];
					console.log( entry );
					if (entry == searchText ) {
						found = entry;
						break;
					}
				}
			}
			//CRUD for getting result.json
			function callResultGetGrid(){
				crudFactory.getData( $attrs.resultgetgrid ).then( function( data ) {
					$scope.resultGetGrid = data;				
					//console.log( 'result' )
					//console.log( data )
					updateResultJson();
				});
			}
			
			//CRUD result used in server
			//comment $scope.masterData for checking locally
			//		
			$scope.$on('searchResult', function( event, data ) { 
				//$scope.masterData = data;
				resultDataMapping();
				childCollapseFn();
			});
		}
		
		
	};
});