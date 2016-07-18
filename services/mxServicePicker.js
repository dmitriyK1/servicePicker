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

            if (result.operations) {
                matches.push({ type: 'title', name: 'operations', shortName: 'operations' });
                matches.push.apply(matches, result.operations);
                matches.operations = true;
            }

            if (result.services) {
                matches.push({ type: 'title', name: 'services', shortName: 'services' });
                matches.push.apply(matches, result.services);
                matches.services = true;
            }

            if (result.hosts) {
                matches.push({ type: 'title', name: 'hosts', shortName: 'hosts' });
                matches.push.apply(matches, result.hosts);
                matches.hosts = true;
            }

            // console.log(result);
            // console.log(matches);

            $rootScope.result = result;
            $rootScope.query  = options;

            return matches;
        }

    }

})(window);
