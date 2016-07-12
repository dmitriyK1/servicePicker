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

            // console.log(`Mode: ${mode} | Keyword: ${keyword} | hostId: ${hostId} | serviceId: ${serviceId}`);

            var result = w.search({
                keyword : keyword,
                mode    : mode
            });

            // TODO: REFACTOR into controller convertor call ( that adds toString method into object )
            result.forEach(function (value) {
                value.toString = function() {
                    return this.name;
                };
            });

            console.log(result);

            return result;
        }

    }

})(window);
