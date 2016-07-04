(function(w) {
    'use strict';

    angular
        .module('app')
        .directive('mxPickerNew', mxPickerNew)
        // .directive('mxPickerAutocomplete', mxPickerAutocomplete)
        // .directive('clearAutocompleteBtn', clearAutocompleteBtn)
        // .directive('sglclick', singleClick)

    function mxPickerNew() {
        var directive = new mx.components.FormControlBase(mx.components.MxPickerCtrl, 'directives/mxPicker.directive.html');

        angular.extend(directive.bindToController, mx.components.BasePickerProperties);

        directive.bindToController.disabled     = '=ngDisabled';
        directive.bindToController.required     = '=';
        directive.bindToController.hint         = '@';
        directive.bindToController.loadOnTyping = '@';

        console.log(directive.bindToController)

        return directive;
    }

    function singleClick($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                var fn     = $parse(attr['sglclick']);
                var delay  = 250;
                var clicks = 0;
                var timer  = null;

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

    // function mxPickerNew() {
    //     var bindToController = {
    //         disabled     : '=ngDisabled',
    //         readOnly     : '=',
    //         required     : '=',
    //         label        : '@',
    //         hint         : '@',
    //         model        : "=ngModel",
    //         name         : "@",
    //         onChange     : "&"
    //     };
    //
    //     angular.extend(bindToController, w.mx.components.CommonPickerProperties);
    //
    //     var ddo = {
    //         templateUrl      : 'directives/mxPicker.directive.html',
    //         controller       : 'MxPickerCtrl as vm',
    //         scope            : {},
    //         bindToController : bindToController
    //     };
    //
    //     return ddo;
    // }

    function mxPickerAutocomplete($mdConstant, $compile) {
        var ddo = {
            link    : link,
            require : 'mdAutocomplete'
        };

        return ddo;

        function link(scope, element, attrs, ctrl) {
            scope.searchText  = '';
            scope.querySearch = querySearch;

            element.on('focusin', onFocusIn);
            element.on('focusout', onFocusOut);
            element.on('keydown', onKeyDown);

            scope.$on('$destroy', function() {
                element.off('keydown');
                element.off('focusin');
                element.off('focusout');
            });

            function querySearch(query, items) {
                return query ? scope.filteredItems = items.filter(createFilterFor(query)) : items;
            }

            function createFilterFor(query) {
                var lowercaseQuery = angular.lowercase(query);

                return function filterFn(state) {
                    return (state.toLowerCase().indexOf(lowercaseQuery) === 0);
                };
            }

            function onFocusIn(e) {
                if (e.target.tagName !== 'INPUT') return;

                var inputValue = e.target.value;

                if (inputValue.trim().length === 0) {
                    e.target.value = e.target.value.trim();
                }

                setTimeout(function() {
                    angular
                        .element(document.querySelectorAll('.autocomplete-popover'))
                        .remove();

                    element.removeClass('valid-value');
                }, 100);
            }

            function onFocusOut(e) {
                if (e.target.tagName !== 'INPUT') return;

                setTimeout(function() {
                    if (!scope.searchText)    return;
                    if (!scope.filteredItems) return;

                    var isFound = scope.vm.items.some(function(value) {
                        return value.toLowerCase() === scope.searchText.toLowerCase();
                    });

                    if (scope.searchText !== scope.filteredItems[0]) {
                        ctrl.scope.isValidSearch = false;
                        return;
                    }

                    ctrl.scope.isValidSearch = true;

                    scope.doubleClick = function() {
                        angular
                            .element(document.querySelectorAll('.autocomplete-popover'))
                            .remove();

                        var input = element.find('input')[0];

                        input.focus();
                        input.setSelectionRange(0, input.value.length);
                    };

                    var template = '<div tabindex="-1" sglclick="vm.navigateItem(searchText)" ng-dblclick="doubleClick()">';
                    var linkFn   = $compile(template);
                    var popover  = linkFn(scope);

                    popover
                        .addClass('autocomplete-popover')
                        .html(scope.searchText);

                    element.append(popover);
                    element.addClass('valid-value');
                }, 10);
            }

            function onKeyDown(event) {
                if (!scope.filteredItems) return;
                if (!scope.searchText) return;

                if (scope.filteredItems.length && ~scope.filteredItems[0].indexOf(scope.searchText)) {
                    scope.selectedItem = null;
                    return;
                }

                if (event.keyCode !== $mdConstant.KEY_CODE.TAB)  return;
                if (scope.filteredItems.length !== 1)            return;
                if (scope.searchText === scope.filteredItems[0]) return;

                ctrl.select(0);
            }

        }
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
