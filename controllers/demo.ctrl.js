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

        vm.onChange          = onChange;
        vm.onNavigateHost    = onNavigateHost;
        vm.onNavigateService = onNavigateService;

        function onChange() {
            console.log('search item changed');
        }

        function onNavigateHost(host) {
            alert('navigate host: ' + host);
        }

        function onNavigateService(service) {
            alert('navigate service: ' + service);
        }

    }

})(window);
