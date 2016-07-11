(function(w) {

    'use strict';

    angular
        .module('app')
        .controller('MxServicePickerCtrl', MxServicePickerCtrl)

    function MxServicePickerCtrl(ServicePicker) {
        var vm = this;
        vm.keyword = '';
        vm.search = ServicePicker.search;

        // vm.hosts = ServicePicker.search({
        //     mode: 'hosts'
        // });

    }

})(window);
