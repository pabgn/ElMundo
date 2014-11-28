(function (angular, window) {
	'use strict';

	window.app = angular.module('em', ['ionic']);

	window.app.run(['$ionicPlatform', function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
		    	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		    }

		    if (window.StatusBar) {
		    	StatusBar.styleDefault();
		    }
		})
	}]);

}(angular, window));