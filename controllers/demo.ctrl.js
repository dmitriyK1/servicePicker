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
        vm.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

        vm.mode  = 'service';
        vm.modes = ['service', 'operation'];

        vm.onChange = onChange;

        vm.searchService  = ServicePicker;

        function onChange() {
            console.log('search item changed');
        }

    }

})(window);
