(function(w) {
    'use strict';

    angular
        .module('app')
        .directive('mxServicePicker', mxServicePicker)

    function mxServicePicker() {
        var ddo = {
            restrict    : 'E',
            controller  : 'MxServicePickerCtrl as vm',
            templateUrl : 'directives/mxServicePicker.directive.html',
            scope       : {},

            bindToController : {
                disabled : '=ngDisabled',
                label    : '@',
                mode     : '@',
                // model    : '=ngModel',
                required : '='
            },

            link: link
        };

        return ddo;

        function link(scope, element, attrs, ctrl) {
            element.on('click', function() {
                console.log('click');
            });
        }

    }

})(window);
