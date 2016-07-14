(function(w) {
    'use strict';

    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    function ServicePicker($rootScope) {
        var service    = this;
        service.search = search;

        return service;

        function search(options) {
            var mode    = options.mode;
            var keyword = options.keyword;

            console.log('options: ', options);

            if (options.currentHost) {
                var hostId = options.hostId;
            }

            if (options.currentService) {
                var serviceId = options.serviceId;
            }

            var result = w.search({
                keyword   : keyword,
                mode      : mode,
                hostId    : hostId,
                serviceId : serviceId
            });

            var matches = [];

            if (result.hosts) {
                matches.push.apply(matches, result.hosts);
                matches.hosts = true;
            }

            if (result.services) {
                matches.push.apply(matches, result.services);
                matches.services = true;
            }

            if (result.operations) {
                matches.push.apply(matches, result.operations);
                matches.operations = true;
            }

            console.log(result);
            // console.log(matches);
            $rootScope.result = result;
            $rootScope.query  = options;

            return matches;
        }

    }

})(window);
