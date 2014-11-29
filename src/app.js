(function (angular, window) {
	'use strict';

	window.app = angular.module('em', ['ionic', 'ionic.contrib.ui.cards'])
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
	.value('endpoint', 'http://178.62.30.80:3001')
	.value('filesEndpoint', 'http://localhost:3001/file/');

}(angular, window));