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

        vm.mode       = 'host';
        vm.modes = ['host', 'service', 'operation'];

        // vm.mode    = 'service';
        // vm.mode    = 'operation';

        vm.onChange = onChange;

        vm.service  = ServicePicker;

        function onChange() {
            console.log('search item changed');
        }

    }

})(window);
