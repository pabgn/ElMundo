(function (app) {
	'use strict';

	app.service('newsService', ['$q', '$http', 'endpoint',
		function ($q, $http, endpoint) {
			/**
			 * Retrieves news of a specific category
			 * @param  {String} category Category name
			 * @return {promise}         Promise that will be fulfilled with the news object
			 */
			var getCategory = function (category) {
				var deferred = $q.defer();

				$http.get(endpoint + '/categories/' + category).then(function (response) {
					deferred.resolve(response.data);
				}, function () {
					deferred.resolve({"news": []});
				});

				return deferred.promise;
			};

			return {
				getCategory : getCategory
			};
		}
	]);

}(window.app));