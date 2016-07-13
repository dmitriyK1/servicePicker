(function(w) {

    'use strict';

    angular
        .module('app')
        .controller('MxServicePickerCtrl', MxServicePickerCtrl)

    function MxServicePickerCtrl(ServicePicker) {
        var vm      = this;
        vm.search   = ServicePicker.search;
        vm.onChange = onChange;
        vm.dblClick = dblClick;

        function onChange(item) {
            vm.model = item;
        }

        function dblClick(e, type) {
            var keyword      = vm.keyword;
            var pathSections = keyword.split('.');
            var host         = pathSections[0];
            var service      = pathSections[1];
            var operation    = pathSections[2];
            var container    = angular.element(e.target.closest('md-input-container'));
            var input        = container.find('input')[0];

            if (type === 'host') {
                input.setSelectionRange(0, host.length);
            }

            if (type === 'service') {
                var hostLen    = host.length + 1;
                var serviceLen = service.length;

                input.setSelectionRange(hostLen, hostLen + serviceLen);
            }

                input.focus();
        }
    }

})(window);
