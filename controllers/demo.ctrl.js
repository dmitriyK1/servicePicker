(function(w) {
    'use strict';

    angular
        .module('app')
        .controller('DemoCtrl', DemoCtrl)

    function DemoCtrl() {
        var vm = this;

        vm.isDisabled = false;
        vm.isReadOnly = false;
        vm.isRequired = true;

        vm.selected = undefined;

        vm.mode      = 'operations';
        vm.modes     = ['services', 'operations'];
        vm.someModel = 777;

        vm.onChange = onChange;

        function onChange() {
            console.log('search item changed');
        }

    }

})(window);
