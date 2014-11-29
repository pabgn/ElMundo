(function (angular, window) {
	'use strict';

	window.app = angular.module('em', ['ionic'])
	.run(['$ionicPlatform', function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
		    	cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		    }

		    if (window.StatusBar) {
		    	StatusBar.styleDefault();
		    }
		})
	}])
	.value('endpoint', 'http://localhost:3001');

}(angular, window));