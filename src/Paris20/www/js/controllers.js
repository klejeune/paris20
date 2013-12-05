var paris20Controllers = angular.module('paris20Controllers', []);

paris20Controllers.controller('AccueilController', ['$scope', '$http',
	function AccueilController($scope, $http) {
	}
]);

paris20Controllers.controller('NewsController', ['$scope', '$http', 'FeedService',
	function NewsController($scope, $http, feed) {
		$scope.isViewLoading = true;

		$scope.toFrench = function(myDate) {
			var date = new Date(myDate);
			var day = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
			var hour = date.getHours() + ":" + date.getMinutes();
			
			return day + " " + hour;
		};

		$scope.feedSrc = 'http://feeds2.feedburner.com/mairie20';
		$scope.webSiteUrl = 'http://mairie20.paris.fr/';
		
		feed.parseFeed($scope.feedSrc).then(function (res) {
            $scope.feeds = res.data.responseData.feed.entries;
			$scope.errorMessage = res;
			$scope.isViewLoading = false;
        });
	}
]);

paris20Controllers.controller('AProposController', ['$scope', '$http', '$filter',
	function AProposController($scope, $http, $filter) {

	}
]);

paris20Controllers.controller('ParticipezController', ['$scope', '$http', '$filter',
	function ParticipezController($scope, $http, $filter) {

	}
]);

paris20Controllers.controller('ProblemesController', ['$scope', 'ProblemesService', '$filter',
	function ProblemesController($scope, problemes, $filter) {
		problemes.getCategories(function(data) {
			$scope.problemes = data;
			//$scope.problemes = $filter('filter')(data, {"isDebut": true});
			$scope.backLink = '#';
		});
	}
]);

paris20Controllers.controller('StatsController', ['$scope', 'ChartService', 'ProblemesService',
	function ProblemesController($scope, chart, problemes) {
		$scope.areLastProblemesLoading = true;
		$scope.isChartLoading = true;
		
		problemes.list(function (err, result) {
			problemes.getCategories(function(data) {
				$scope.isChartLoading = false;
				chart.draw(result, function(id) {
					var itemForId = data.filter(function (item) { return item.id == id; })[0];
					return {
						id: id, 
						color: itemForId.color,
						label: itemForId.name
					};
				});	
			});			
		});	

		problemes.getLast(function(err, result) {
			$scope.areLastProblemesLoading = false;
			$scope.lastProblemes = result;
		});
	}
]);

paris20Controllers.controller('ConditionsController', ['$scope', '$http', '$filter',
	function ProblemesController($scope, $http, $filter) {
	}
]);

paris20Controllers.controller('CarteController', ['$scope', '$http', '$filter',
	function CarteController($scope, $http, $filter) {
	}
]);

paris20Controllers.controller('ProblemesCategorieController', ['$scope', '$routeParams', '$http', '$filter',
	function ProblemesController($scope, $routeParams, $http, $filter) {
		$http.get('data/problemes.json').success(function(data) {
			$scope.categorie = $filter('filter')(data, {"id": $routeParams.problemeId})[0];
			
			if ($scope.categorie.sousproblemes && $scope.categorie.sousproblemes.length > 0) {
				$scope.problemes = $filter('filter')(data, {"id": $scope.categorie.sousproblemes});
				//$scope.backLink = '#/problemes/' + $routeParams.problemeId;
				$scope.backLink = '#/problemes/';
			}
			else {
				$scope.problemes = [];
				$scope.backLink = '#/problemes/';
			}
		});
	}
]);

paris20Controllers.controller('PhoneListCtrl', ['$scope', '$http',
	function PhoneListCtrl($scope, $http) {
		$http.get('phones/phones.json').success(function(data) {
			$scope.phones = data;
		});

		$scope.orderProp = 'age';
	}
]);

paris20Controllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams',
	function($scope, $routeParams) {
		$scope.phoneId = $routeParams.phoneId;
	}
]);