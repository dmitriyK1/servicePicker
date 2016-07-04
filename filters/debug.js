(function(w) {
    'use strict';

    angular
        .module('app')
        .filter('debug', debugFilter);

    function debugFilter() {
        return function filter(value) {
            return Object.keys(value);
        }
    }

})(window);
