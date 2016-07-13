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

            return matches;
        }

    }

})(window);
