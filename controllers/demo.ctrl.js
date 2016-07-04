(function(w) {
    'use strict';

    angular
        .module('app')
        .controller('DemoCtrl', DemoCtrl)

    function DemoCtrl($q) {
        var vm = this;

        vm.isReadOnly = false;
        vm.isDisabled = false;
        vm.isRequired = true;

        vm.mode       = 'host';
        // vm.mode    = 'service';
        // vm.mode    = 'operation';

        vm.onChange = onChange;

        function onChange() {
            console.log('search item changed');
        }

    }

})(window);
