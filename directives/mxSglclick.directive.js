(function(w) {
    'use strict';

    angular
        .module('app')
        .directive('mxSglclick', mxSglclick)

    mxSglclick.$inject = ['$parse'];

    function mxSglclick($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var fn = $parse(attr['mxSglclick']);
                var delay = 250;
                var clicks = 0;
                var timer = null;

                element.on('click', function(event) {
                    clicks++;

                    if (clicks === 1) {
                        timer = setTimeout(function() {
                            scope.$apply(function() {
                                fn(scope, {
                                    $event: event
                                });
                            });

                            clicks = 0;

                        }, delay);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                    }
                });
            }
        };
    }

})(window);
