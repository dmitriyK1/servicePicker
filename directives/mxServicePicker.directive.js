(function(w) {
    'use strict';

    angular
        .module('app')
        .directive('mxServicePicker', mxServicePicker)
        .directive('clearAutocompleteBtn', clearAutocompleteBtn)
        .directive('mxServiceAutocomplete', mxServiceAutocomplete)

    function mxServiceAutocomplete() {
        var ddo = {
            require: 'mdAutocomplete',
            link: link
        };

        return ddo;

        function link(scope, element, attrs, ctrl) {
            element.on('keydown', onKeyDown);

            function onKeyDown(e) {
                if (e.keyCode !== 190) return;

                console.log('dot pressed');
                scope.vm.model.search(scope.vm);
            }

        }
    }

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
                model    : '=ngModel',
                required : '='
            }
        };

        return ddo;
    }

    function clearAutocompleteBtn($parse, $compile) {
        var ddo = {
            restrict: 'A',
            link: link
        };

        return ddo;

        function link(scope, element, attrs) {

            if (!attrs.mdFloatingLabel) return;

            var template = [
                '<md-button ng-hide="vm.disabled || vm.readOnly" tabindex="-1" class="md-icon-button clear-autocomplete">',
                '<md-icon md-svg-icon="md-close">',
                '</md-icon>',
                '</md-button>'
            ].join('');

            var linkFn = $compile(template);
            var button = linkFn(scope);
            element.append(button);

            var searchTextModel = $parse(attrs.mdSearchText);

            scope.$watch(searchTextModel, function(searchText) {
                if (searchText && searchText !== '' && searchText !== null) {
                    button.addClass('visible');
                } else {
                    button.removeClass('visible');
                }
            });

            button.on('click', onClick);

            scope.$on('$destroy', function() {
                button.off('click');
            });

            function onClick() {
                searchTextModel.assign(scope, undefined);
                scope.$digest();
                angular.element(document.querySelectorAll('.autocomplete-popover')).remove();
                element.removeClass('valid-value');
            }
        }
    }

})(window);
