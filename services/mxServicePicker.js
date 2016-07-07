(function(w) {
    'use strict';

    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    function ServicePicker() {
        var service = this;

        service.search = search;

        return service;

        function search(options) {
            var mode      = options.mode;
            var keyword   = options.keyword;
            var hostId    = options.hostId;
            var serviceId = options.serviceId;

            console.log('Searching from a service...');
        }

    }

})(window);
