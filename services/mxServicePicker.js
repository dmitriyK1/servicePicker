(function(w) {
    'use strict';

    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    function ServicePicker() {
        console.log('ServicePicker service initialized');

        var service = this;

        service.search           = search;
        service.getDisplayString = getDisplayString;

        return service;

        function search(options) {
            var mode      = options.mode;
            var keyword   = options.keyword;
            var hostId    = options.hostId;
            var serviceId = options.serviceId;

            if (!mode) throw new Error('Mode not specified.');

            if (mode === 'service')   return _searchForService(keyword);
            if (mode === 'operation') return _searchForOperation(keyword);

            throw new Error('Unknown mode');
        }

        function getDisplayString(id) { }

        function _searchForService(keyword) {
            console.log('searching for a service...');

            var serviceSearchResult = {
                id          : 111,
                serviceName : 'myServiceName'
            };

            return serviceSearchResult;
        }

        function _searchForOperation(keyword) {
            console.log('searching for an operation...');

            var operationSearchResult = {
                id            : 222,
                operationName : 'myOperationName'
            };

            return operationSearchResult;
        }

    }

})(window);
