(function(w) {

    angular
        .module('app')
        .directive('mxClearPickerBtn', mxClearPickerBtn);

    function mxClearPickerBtn($parse, $compile) {
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
            }
        }

    }

})(window);
