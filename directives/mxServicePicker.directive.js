(function(w) {
    'use strict';

    angular
        .module('app')
        .directive('mxServicePicker', mxServicePicker)

    function mxServicePicker($mdConstant) {
        var ddo = {
            restrict: 'E',
            controller: 'MxServicePickerCtrl as vm',
            templateUrl: 'directives/mxServicePicker.directive.html',
            scope: {},

            bindToController: {
                disabled : '=ngDisabled',
                label    : '@',
                mode     : '@',
                model    : '=ngModel',
                required : '=',
                readOnly : '='
            },

            link: link

        };

        return ddo;

        function link(scope, element, attrs, ctrl) {
            element.on('keydown', onKeyDown);

            scope.$on('$destroy', function cleanUp() {
                element.off();
            });

            function onKeyDown(e) {
                var isCtrlPressed = e.ctrlKey;
                var isShiftPressed = e.shiftKey;
                var isXPressed = e.keyCode === 88;
                var isVPressed = e.keyCode === 86;
                var isTabPressed = e.keyCode === $mdConstant.KEY_CODE.TAB;
                var isDeletePressed = e.keyCode === $mdConstant.KEY_CODE.DELETE;
                var isBackspacePressed = e.keyCode === $mdConstant.KEY_CODE.BACKSPACE;
                var isMovementKeyPressed = e.keyCode === $mdConstant.KEY_CODE.UP_ARROW ||
                    e.keyCode === $mdConstant.KEY_CODE.DOWN_ARROW ||
                    e.keyCode === $mdConstant.KEY_CODE.LEFT_ARROW ||
                    e.keyCode === $mdConstant.KEY_CODE.RIGHT_ARROW ||
                    e.keyCode === $mdConstant.KEY_CODE.HOME ||
                    e.keyCode === $mdConstant.KEY_CODE.END;

                if (scope.vm.readOnly) {
                    if (isDeletePressed || isBackspacePressed || isXPressed || isVPressed) {
                        e.preventDefault();
                    }

                    if (!isCtrlPressed && !isTabPressed && !isMovementKeyPressed) {
                        e.preventDefault();
                    }
                }

            }

        }

    }

})(window);
