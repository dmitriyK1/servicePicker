(function(w) {
    'use strict';

    angular
        .module('app')
        .controller('DemoCtrl', DemoCtrl)

    function DemoCtrl(ServicePicker) {
        var vm = this;

        vm.isDisabled = false;
        vm.isReadOnly = false;
        vm.isRequired = true;

        vm.selected = undefined;

        vm.mode  = 'service';
        vm.modes = ['service', 'operation'];

        vm.onChange = onChange;

        vm.searchService  = ServicePicker;

        function onChange() {
            console.log('search item changed');
        }

    }

})(window);
