(function (app) {
	'use strict';

	app.directive('newsListTpl', function () {
		return {
			restrict: 'E',
			scope: {
				category: '=category',
				newsList: '=newsList'
			},
			templateUrl: 'templates/news-list.html',
			controller: ['$scope', function ($scope) {
				$scope.hasImage = function (news) {
					return news.media && news.media.length > 0;
				};

				$scope.newsTitle = function (news) {
					if (!news.title.split('|')[1]) return '';
					return news.title.split('|')[1].trim();
				};

				$scope.newsContent = function (news) {
					return news.content;
				};

				$scope.newsImage = function (news) {
					if (!news.media) return '';
					return news.media[0].url;
				};

				$scope.readNews = function (index) {
					$scope.$parent.sectionIndex[1] = index;
					$scope.$parent.nextLevel();
				};

			}]
		};
	});

}(window.app));