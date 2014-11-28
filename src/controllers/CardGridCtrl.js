(function (app, Suaip) {
	'use strict';

	app.controller('CardGridCtrl', ['$scope', function ($scope) {
		$scope.level = 0;
		$scope.sectionIndex = [1, 0];

		$scope.canGoNext = function () {
			return true;
		};

		$scope.canGoPrev = function () {
			return true;
		};

		$scope.prev = function () {

		};

		$scope.next = function () {

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