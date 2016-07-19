(function(w) {
    'use strict';

    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    ServicePicker.$inject = ['$rootScope'];

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

            if (result.hosts && result.hosts.length) {
                matches.push({ type: 'title', name: 'Hosts', shortName: 'Hosts' });
                matches.push.apply(matches, result.hosts);
                matches.hosts = true;
            }


            if (result.services && result.services.length) {
                matches.push({ type: 'title', name: 'Services', shortName: 'Services' });
                matches.push.apply(matches, result.services);
                matches.services = true;
            }

            if (result.operations && result.operations.length) {
                matches.push({ type: 'title', name: 'Operations', shortName: 'Operations' });
                matches.push.apply(matches, result.operations);
                matches.operations = true;
            }

            $rootScope.result = result;
            $rootScope.query  = options;

            console.log(result);

            return matches;
        }

    }

})(window);
