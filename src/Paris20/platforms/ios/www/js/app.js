var phonecatApp = angular.module('paris20App', [
	'ngRoute',
	'paris20Controllers'
]);

phonecatApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/accueil', {
				templateUrl: 'partials/accueil/index.html',
				controller: 'AccueilController'
			})
			.when('/news', {
				templateUrl: 'partials/news/index.html',
				controller: 'NewsController'
			})
			.when('/conditions', {
				templateUrl: 'partials/conditions.html',
				controller: 'ConditionsController'
			})
			.when('/participez', {
				templateUrl: 'partials/participez.html',
				controller: 'ParticipezController'
			})
			.when('/stats', {
				templateUrl: 'partials/stats.html',
				controller: 'StatsController'
			})
			.when('/problemes/:problemeId', {
				templateUrl: 'partials/problemes/index.html',
				controller: 'ProblemesCategorieController'
			})
			.when('/problemes', {
				templateUrl: 'partials/problemes/index.html',
				controller: 'ProblemesController'
			})
			.when('/carte', {
				templateUrl: 'partials/carte/index.html',
				controller: 'CarteController'
			})
			.when('/a-propos', {
				templateUrl: 'partials/a-propos.html',
				controller: 'AProposController'
			})
			.otherwise({
				redirectTo: '/accueil'
			});
	}]);
	
function sendProbleme() {
	var typeProbleme = $('.type-dropdown option:selected').val();
	var description =  $('.probleme-description').val();
	
	var url = "http://appli.pirates20.fr:8888/insert?name=" + "Probleme" + "&type=" + typeProbleme + "&description=" + description;
	
	var success = false;
	var button = $('.send-probleme-button');
	button.html('... Envoi...');
	
	$.ajax({
		type: 'get',
		url: url,
		error: function(xhr, status, error) {
			button.html("<span class='glyphicon glyphicon-remove'></span> Erreur, veuillez r&eacute;ssayer...");
			button.addClass('btn-danger');				
		},
		success: function() {
			button.html("<span class='glyphicon glyphicon-ok'></span> Merci de votre envoi !");
			button.addClass('btn-success');	
			button.attr('disabled', 'disabled');
		}
	});
}

// http://www.ivivelabs.com/blog/making-a-quick-feed-reader-using-angularjs/
phonecatApp.factory('FeedService', ['$http', function ($http) {
    return {
        parseFeed: function (url) {
            return $http.jsonp('http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        },
    }
}]);

phonecatApp.factory('ProblemesService', ['$http', function ($http) {
    return {
		baseUrl: function() {
			return "http://appli.pirates20.fr:8888";
		},
        list: function (callback) {
			$http.get(this.baseUrl() + '/stats').success(function(data) {
				callback(null, data);
			});
        },
		getCategories: function(callback) {
			$http.get('data/problemes.json').success(callback);
		},
		getLast: function(callback) {
			var url = this.baseUrl() + '/last';
			$http.get('data/problemes.json').success(function(err, res) {
				$http.get(url).success(function(data) {
					callback(null, data);
				});
			});
		}
    }
}]);

phonecatApp.factory('ChartService', ['$http', function ($http) {
	return {
		normalize: function(data) {
			var today = new Date();
			today.setHours(0, 0, 0, 0);
			var normalizedData =  {
				data: [],
				max: 100,
				labels: [],
				firstDay: today,
				xLabels: []
			};
			
			for(var dataSetKey in data) {
				var dataSet = data[dataSetKey];
				var list = [];
				for (var i = 0; i < 7; i++) {
					//var myDate = new Date(today);
					//myDate.setDate(myDate.getDate() - 7 + i);
					
					var dateOffset = (24*60*60*1000) * (6 - i);
					var myDate = new Date(today);
					myDate.setTime(myDate.getTime() - dateOffset);
					
					//alert("Today is " + today + "\nLast week was " + myDate + "\n" + myDate.getDate() + "/" + myDate.getMonth() + "/" + myDate.getFullYear());
					//alert("Comparing " + myDate.getDay() + "/" + myDate.getMonth() + "/" + myDate.getFullYear() + " to\n" + JSON.stringify(dataSet.dailyusage) + "\n (Today is " + today + ")");
					var dataElement = dataSet.dailyusage.filter(function(item) { return item.day == myDate.getDate() && item.month == (myDate.getMonth() + 1) && item.year == myDate.getFullYear(); });
					
					normalizedData.xLabels.push(myDate);
					
					if (dataElement.length > 0) {
						list.push({ x: myDate, y: dataElement[0].count });
					}
					else {
						list.push({ x: myDate, y: 0 });
					}
				}
				
				//normalizedData.push({category: dataSet._id, data: list});
				normalizedData.data.push(list);
				normalizedData.labels.push(dataSet._id.type);
			}
			
			//alert(JSON.stringify(normalizedData.xLabels));
			
			return normalizedData;
		},
		draw: function(data, getColor) {		
			normalized = this.normalize(data);
		
			/* Sizing and scales. */
			var w = 400,
				h = 200,
				//x = pv.Scale.linear(0, 6).range(0, w),
				x = pv.Scale.linear(normalized.xLabels, function (d) { return d; }).range(0, w),
				y = pv.Scale.linear(0, normalized.max).range(0, h);

			/* The root panel. */
			var vis = new pv.Panel()
				.canvas('fig')
				.width(w)
				.height(h)
				.bottom(20)
				.left(20)
				.right(10)
				.top(5);

			/* X-axis and ticks. */
			vis.add(pv.Rule)
					.data(x.ticks())
					//.visible(function(d) { return alert(d.x); normalized.xLabels[d.x]; })
					.visible(function(d) { return d; })
					.left(x)
					//.bottom(95)
					.bottom(-5)
					.height(5)
				.anchor("bottom").add(pv.Label)
					.text(pv.Format.date("%d/%m"));

			/* The stack layout. */
			vis.add(pv.Layout.Stack)
				.layers(normalized.data)
				//.bottom(100)
				.x(function(d) { return x(d.x); })
				.y(function(d) { return y(d.y); })
				.layer.add(pv.Area);
				
			vis.add(pv.Panel)
				.data(normalized.labels.map(function (label) { return getColor(label); }))
				.left(10)
				.top(function() { return 0+20*this.index; })
				.height(15)
				.width(20)
				.fillStyle(function(d) { return d.color; })
				.anchor("right").add(pv.Label).textAlign("left").text(function(d) { return d.label; });

			/* Y-axis and ticks. */
			vis.add(pv.Rule)
				.data(y.ticks(3))
				.bottom(y)
				.strokeStyle(function(d) { return d ? "rgba(128,128,128,.2)" : "#000"; })
			  .anchor("left").add(pv.Label)
				.text(y.tickFormat);

			vis.render();		
		}
	}
}]);

