(function (app, Suaip) {
	'use strict';

	app.controller('CardGridCtrl', ['$scope', 'newsService', function ($scope, newsService) {
		$scope.level = 0;
		$scope.sectionIndex = [1, 0];
		$scope.selectedCategory = 0;
		$scope.showIntro = true;
		$scope.userCategories = JSON.parse(localStorage.getItem('user_preferences'));
		$scope.news = {};
		$scope.selectedCategories = {};
		$scope.categories = [
			{
				icon: 'home',
				title: 'España',
				url: 'espana'
			},
			{
				icon: 'bubble',
				title: 'Opinión',
				url: 'opinion'
			},
			{
				icon: 'globe',
				title: 'Internacional',
				url: 'internacional'
			},
			{
				icon: 'bars',
				title: 'Economía',
				url: 'economia'
			},
			{
				icon: 'football',
				title: 'Deportes',
				url: 'deportes'
			},
			{
				icon: 'book',
				title: 'Cultura',
				url: 'cultura'
			},
			{
				icon: 'rocket',
				title: 'Ciencia',
				url: 'ciencia'
			},
			{
				icon: 'tv2',
				title: 'Televisión',
				url: 'television'
			},
			{
				icon: 'heart',
				title: 'Salud',
				url: 'salud'
			}
		];

		$scope.categoriesName = {
			salud: 'Salud',
			ciencia: 'Ciencia',
			economia: 'Economía',
			television: 'Televisión',
			cultura: 'Cultura',
			deportes: 'Deportes',
			internacional: 'Internacional',
			opinion: 'Opinión',
			espana: 'España'
		};

		/**
		 * 1 = CENTER, 0 = LEFT, 2 = RIGHT
		 * @type {Number}
		 */
		var activeCard = 1;

		$scope.getCurrentNews = function () {
			return $scope.news[$scope.userCategories[$scope.selectedCategory]].news;
		};

		$scope.iconForCategory = function (category) {
			var o = {};
			o['icon-' + category.icon] = true;

			return o;
		};

		$scope.selectCategory = function ($event, category) {
			var selectedNum = Object.keys($scope.selectedCategories).map(function (key) {
			    return $scope.selectedCategories[key];
			}).filter(function (v) {
				return v;
			}).length;

			if (selectedNum >= 3) {
				$event.preventDefault();
				$event.stopPropagation();
				$scope.selectedCategories[category] = false;
			}
		};

		$scope.loadUserCategories = function () {
			for (var i = 0, len = $scope.userCategories.length; i < len; i++) {
				(function (i, len) {
					newsService.getCategory($scope.userCategories[i])
					.then(function (data) {
						$scope.news[$scope.userCategories[i]] = data;

						if (i === len - 1) {
							localStorage.setItem('news', JSON.stringify($scope.news));
						}
					});
				}(i, len));
			}
 		};

		$scope.loadNews = function () {
			var news = localStorage.getItem('news');
			if (!news) {
				$scope.loadUserCategories();
			} else {
				$scope.news = JSON.parse(news);
			}
		};

		if ($scope.userCategories) {
			$scope.showIntro = false;
			$scope.loadNews();
		}

		$scope.selectCategories = function () {
			var userCategories = Object.keys($scope.selectedCategories).map(function (k) {
				return $scope.selectedCategories[k] ? k : '';
			}).filter(function (k) {
				return k !== '';
			});

			localStorage.setItem('user_preferences', JSON.stringify(userCategories));
			$scope.userCategories = userCategories;
			$scope.loadNews();

			$scope.showIntro = false;
		};

		$scope.canGoNext = function () {
			var i = $scope.sectionIndex[$scope.level];
			return $scope.news && $scope.userCategories && i < $scope.news[$scope.userCategories[$scope.selectedCategory]].news.length - 1;
		};

		$scope.canGoPrev = function () {
			return $scope.sectionIndex[$scope.level] > 0;
		};

		$scope.getCurrentArticle = function () {
			var i = $scope.sectionIndex[$scope.level];
			if ($scope.news && $scope.userCategories) {
				return $scope.news[$scope.userCategories[$scope.selectedCategory]].news[i];
			} else {
				return {};
			}
		};

		$scope.getPrevArticle = function () {
			if ($scope.canGoPrev()) {
				var i = $scope.sectionIndex[$scope.level];
				return $scope.news[$scope.userCategories[$scope.selectedCategory]].news[i - 1];
			}

			return {};
		};

		$scope.getNextArticle = function () {
			if ($scope.canGoNext()) {
				var i = $scope.sectionIndex[$scope.level];
				return $scope.news[$scope.userCategories[$scope.selectedCategory]].news[i + 1];
			}

			return {};
		};

		$scope.getCategory = function () {
			return ($scope.userCategories) ? $scope.categoriesName[$scope.userCategories[$scope.selectedCategory]] : '';
		};

		$scope.prev = function () {
			activeCard--;
			if (activeCard < 0) activeCard = 2;
			$scope.$digest();
		};

		$scope.next = function () {
			activeCard++;
			if (activeCard > 2) activeCard = 0;

			$scope.$digest();
		};

		$scope.articleForCenter = function () {
			if (activeCard === 1) {
				return $scope.getCurrentArticle();
			} else if (activeCard > 1) {
				return $scope.getPrevArticle();
			} else {
				return $scope.getNextArticle();
			}
		};

		$scope.articleForLeft = function () {
			if (activeCard === 0) {
				return $scope.getCurrentArticle();
			} else if (activeCard === 2) {
				return $scope.getNextArticle();
			} else {
				return $scope.getPrevArticle();
			}
		};

		$scope.articleForRight = function () {
			if (activeCard === 2) {
				return $scope.getCurrentArticle();
			} else if (activeCard === 0) {
				return $scope.getPrevArticle();
			} else {
				return $scope.getNextArticle();
			}
		};

		$scope.showCenter = function () {
			if (activeCard === 1) {
				return $scope.level === 1 && $scope.news;
			} else if (activeCard > 1) {
				return $scope.level === 1 && $scope.canGoPrev();
			} else {
				return $scope.level === 1 && $scope.canGoNext();
			}
		};

		$scope.showLeft = function () {
			if (activeCard === 0) {
				return $scope.level === 1 && $scope.news;
			} else if (activeCard === 1) {
				return $scope.level === 1 && $scope.canGoPrev();
			} else {
				return $scope.level === 1 && $scope.canGoNext();
			}
		};

		$scope.showRight = function () {
			if (activeCard === 2) {
				return $scope.level === 1 && $scope.news;
			} else if (activeCard === 0) {
				return $scope.level === 1 && $scope.canGoPrev();
			} else {
				return $scope.level === 1 && $scope.canGoNext();
			}
		};

		$scope.back = function () {

		};

		$scope.enterRead = function () {

		};

		window.addEventListener('DOMContentLoaded', function () {
			Suaip.init({
				active: document.getElementById('top'),
	            after: document.getElementById('read'),
	            left: document.getElementById('left'),
	            right: document.getElementById('right'),
	            scope: $scope
			});
		});
	}]);

}(window.app, window.Suaip));