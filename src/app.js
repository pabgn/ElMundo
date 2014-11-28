(function (angular, window) {
	'use strict';

	var app = angular.module('em', ['ionic']);

	app.run(['$ionicPlatform', function ($ionicPlatform) {
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