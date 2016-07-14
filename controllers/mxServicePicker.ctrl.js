(function(w) {

    'use strict';

    angular
        .module('app')
        .controller('MxServicePickerCtrl', MxServicePickerCtrl)

    function MxServicePickerCtrl(ServicePicker) {
        var vm          = this;
        vm.search       = ServicePicker.search;
        vm.onItemChange = onItemChange;
        vm.onTextChange = onTextChange;
        vm.dblClick     = dblClick;

        function onTextChange(item, keyword) {
            console.log('keyword: ', keyword);

            if (!keyword) {
                vm.model            = null;
                vm.currentHost      = null;
                vm.currentService   = null;
                vm.currentOperation = null;

                return;
            }

            var pathSections = keyword.split('.');
            var host         = pathSections[0];
            var service      = pathSections[1];
            var operation    = pathSections[2];

            if (!service) {
                vm.currentService = null;
            }

            if (!operation) {
                vm.currentOperation = null;
            }

        }

        function onItemChange(item, keyword) {
            // if (!item) {
            //     vm.currentHost      = null;
            //     vm.currentService   = null;
            //     vm.currentOperation = null;
            //
            //     return;
            // }


            vm.model = item;

            if (!item) return;

            var type = item.type;


            if (type === 'host') {
                vm.currentHost = item;
                vm.currentService = null;
                vm.currentOperation = null;
            }

            if (type === 'service') {
                vm.currentService = item;
                vm.currentOperation = null;
            }

            if (type === 'operation') {
                vm.currentOperation = item;
            }
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
