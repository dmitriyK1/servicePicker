(function(w) {
    'use strict';

    angular
        .module('app')
        .controller('MxPickerCtrl', MxPickerCtrl)

    MxPickerCtrl.$inject = ['$timeout', '$q', '$element', '$scope','mx.internationalization'];

    function MxPickerCtrl($timeout, $q, $element, $scope, internationalization) {
        var vm = this;

        mx.components.SinglePickerCtrl.call(this, $timeout, $q, $element, $scope, internationalization);

        vm.selectedItem                   = vm.model;
        vm.onItemChange                   = onItemChange;
        vm.setSelectedItems               = setSelectedItems;
        vm.selectedItemsToValue           = selectedItemsToValue;
        vm.setAutoCompleteValue           = setAutoCompleteValue;
        // delete
        vm.notFoundMessage = 'No matching states were found.';

        function onItemChange(item) {
            if (vm.onChange) {
                vm.onChange();
            }

            vm.autoCompleteSelectedItemChange(item);
        }

        function setSelectedItems(items) {
            vm.selectedItem = items.length ? items[0] : null;
        }

        function selectedItemsToValue() {
            return vm.selectedItem ? vm.getId(vm.selectedItem) : null;
        }

        function setAutoCompleteValue(value) {
            vm.model = value;
        }
    }

	w.mx                         = w.mx            || {};
	w.mx.components              = w.mx.components || {};
	w.mx.components.MxPickerCtrl = MxPickerCtrl;

})(window);
