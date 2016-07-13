(function(w) {
    'use strict';

    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    function ServicePicker() {
        var service    = this;
        service.search = search;

        return service;

        function search(options) {
            var mode      = options.mode;
            var keyword   = options.keyword;
            var hostId    = options.hostId;
            var serviceId = options.serviceId;

            var result = w.search({
                keyword : keyword,
                mode    : mode
            });

            var hosts = result.some(function(value) {
                return value.type === 'host';
            });

            var services = result.some(function(value) {
                return value.type === 'service';
            });

            var operations = result.some(function(value) {
                return value.type === 'operation';
            });

            result.hosts      = hosts;
            result.services   = services;
            result.operations = operations;

            console.log(result);

            return result;
        }

    }

})(window);
