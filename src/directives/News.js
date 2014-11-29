(function (app) {
	'use strict';

	app.directive('newsTpl', function () {
		return {
			restrict: 'E',
			scope: {
				news: '=news',
				category: '=category'
			},
			templateUrl: 'templates/news.html',
			controller: ['$scope', 'filesEndpoint', function ($scope, filesEndpoint) {
				$scope.getImage = function () {
					return ($scope.news && $scope.news.media) ? filesEndpoint + $scope.news.media[0].url : '';
				};

				$scope.hasImage = function () {
					return $scope.getImage() !== '';
				};

				$scope.getTitle = function () {
					if (!$scope.news.title.split('|')[1]) return '';
					return $scope.news.title.split('|')[1].trim();
				};
			}]
		};
	});

}(window.app));