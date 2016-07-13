(function(w) {

    'use strict';

    angular
        .module('app')
        .controller('MxServicePickerCtrl', MxServicePickerCtrl)

    function MxServicePickerCtrl(ServicePicker) {
        var vm    = this;
        vm.search = ServicePicker.search;
        vm.onChange = onChange;

        function onChange(item) {
            vm.model = item;
        }

        // vm.hosts = ServicePicker.search({
        //     mode: 'hosts'
        // });
    }

})(window);
