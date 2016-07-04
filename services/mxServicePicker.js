(function(w) {
    'use strict';

// --------------------------------------------------------------------------------
//                   Operations
// --------------------------------------------------------------------------------

var operations = [{
    operationId   : 0,
    operationName : 'DeviceInfo'
}, {
    operationId   : 1,
    operationName : 'DeviceRestart'
}, {
    operationId   : 2,
    operationName : 'DeviceUpdate'
}];

var operations2 = [{
    operationId   : 3,
    operationName : 'Update'
}, {
    operationId   : 4,
    operationName : 'Refresh'
}, {
    operationId   : 5,
    operationName : 'Reload'
}];

var operations3 = [{
    operationId   : 6,
    operationName : 'Create'
},{
    operationId   : 7,
    operationName : 'Read'
},{
    operationId   : 8,
    operationName : 'Delete'
}];

var operations4 = [{
    operationId   : 9,
    operationName : 'Options'
}, {
    operationId   : 10,
    operationName : 'Get'
}, {
    operationId   : 11,
    operationName : 'Head'
}];

var operations5 = [{
    operationId   : 12,
    operationName : 'Trace'
}, {
    operationId   : 13,
    operationName : 'Put'
}, {
    operationId   : 14,
    operationName : 'Connect'
}];

var operations6 = [{
    operationId   : 15,
    operationName : 'Fetch'
},{
    operationId   : 16,
    operationName : 'Pull'

},{
    operationId   : 17,
    operationName : 'Push'
}];

// --------------------------------------------------------------------------------
//                   Services
// --------------------------------------------------------------------------------
    var service = {
        serviceId   : 0,
        serviceName : 'Device',
        operations  : operations
    };

    var service2 = {
        serviceId   : 1,
        serviceName : 'ApplicationManagement',
        operations  : operations2
    };

    var service3 = {
        serviceId   : 2,
        serviceName : 'CoreMessaging',
        operations  : operations3
    };

    var service4 = {
        serviceId   : 3,
        serviceName : 'History',
        operations  : operations4
    };

    var service5 = {
        serviceId   : 4,
        serviceName : 'Queue',
        operations  : operations5
    };

    var service6 = {
        serviceId   : 5,
        serviceName : 'Network',
        operations  : operations6
    };
// --------------------------------------------------------------------------------
//                   Hosts
// --------------------------------------------------------------------------------
    var host = {
        hostId   : 0,
        hostName : 'SilverBack',
        services : [service, service2]
    };

    var host2 = {
        hostId   : 1,
        hostName : 'DevEnvironment',
        services : [service2, service3]
    };

    var host3 = {
        hostId   : 2,
        hostName : 'ProductionEnvironment',
        services : [service3, service4]
    };

    var host4 = {
        hostId   : 3,
        hostName : 'TestingEnvironment',
        services : [service4, service5]
    };

    var host5 = {
        hostId   : 4,
        hostName : 'StagingEnvironment',
        services : [service5, service6]
    };
// --------------------------------------------------------------------------------

    var hosts = [host, host2, host3, host4, host5];

    console.log(hosts);


    angular
        .module('app')
        .service('ServicePicker', ServicePicker);

    function ServicePicker() {
        var service = this;

        service.search           = search;
        service.getDisplayString = getDisplayString;

        return service;

        function search(options) {
            var mode      = options.mode;
            var keyword   = options.keyword;
            var hostId    = options.hostId;
            var serviceId = options.serviceId;

            if (!keyword) return;
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
