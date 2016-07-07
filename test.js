Array.prototype.concatAll = function() {
    var results = [];

    this.forEach(function(subArray) {
        subArray.forEach(function(item) {
            results.push(item);
        });
    });

    return results;
};

// ================================================================================

var data = {
    "hosts": [{
            "hostId": 0,
            "hostName": "SilverBack",
            "services": [{
                "serviceId": 0,
                "serviceName": "Device",
                "operations": [{
                    "operationId": 0,
                    "operationName": "DeviceInfo"
                }, {
                    "operationId": 1,
                    "operationName": "DeviceRestart"
                }, {
                    "operationId": 2,
                    "operationName": "DeviceUpdate"
                }]
            }, {
                "serviceId": 1,
                "serviceName": "ApplicationManagement",
                "operations": [{
                    "operationId": 3,
                    "operationName": "Update"
                }, {
                    "operationId": 4,
                    "operationName": "Refresh"
                }, {
                    "operationId": 5,
                    "operationName": "Reload"
                }]
            }]
        },

        {
            "hostId": 1,
            "hostName": "DevEnvironment",
            "services": [{
                "serviceId": 2,
                "serviceName": "CoreMessaging",
                "operations": [{
                    "operationId": 6,
                    "operationName": "Create"
                }, {
                    "operationId": 7,
                    "operationName": "Read"
                }, {
                    "operationId": 8,
                    "operationName": "Delete"
                }]
            }, {
                "serviceId": 3,
                "serviceName": "History",
                "operations": [{
                    "operationId": 9,
                    "operationName": "Options"
                }, {
                    "operationId": 10,
                    "operationName": "Get"
                }, {
                    "operationId": 11,
                    "operationName": "Head"
                }]
            }]
        },

        {
            "hostId": 2,
            "hostName": "ProductionEnvironment",
            "services": [{
                "serviceId": 4,
                "serviceName": "Queue",
                "operations": [{
                    "operationId": 12,
                    "operationName": "Trace"
                }, {
                    "operationId": 13,
                    "operationName": "Put"
                }, {
                    "operationId": 14,
                    "operationName": "Connect"
                }]
            }, {
                "serviceId": 5,
                "serviceName": "Network",
                "operations": [{
                    "operationId": 15,
                    "operationName": "Fetch"
                }, {
                    "operationId": 16,
                    "operationName": "Pull"

                }, {
                    "operationId": 17,
                    "operationName": "Push"
                }]
            }]
        },

        {
            "hostId": 3,
            "hostName": "TestingEnvironment",
            "services": [{
                "serviceId": 6,
                "serviceName": "Device Install Service",
                "operations": [{
                    "operationId": 18,
                    "operationName": "Fetch"
                }, {
                    "operationId": 19,
                    "operationName": "Pull"

                }, {
                    "operationId": 20,
                    "operationName": "Push"
                }]
            }, {
                "serviceId": 7,
                "serviceName": "Enterprise App Management Service",
                "operations": [{
                    "operationId": 21,
                    "operationName": "DeviceInfo"
                }, {
                    "operationId": 22,
                    "operationName": "DeviceRestart"
                }, {
                    "operationId": 23,
                    "operationName": "DeviceUpdate"
                }]
            }]
        },

        {
            "hostId": 4,
            "hostName": "StagingEnvironment",
            "services": [{
                "serviceId": 8,
                "serviceName": "Function Discovery Provider Host",
                "operations": [{
                    "operationId": 3,
                    "operationName": "Update"
                }, {
                    "operationId": 4,
                    "operationName": "Refresh"
                }, {
                    "operationId": 5,
                    "operationName": "Reload"
                }]
            }, {
                "serviceId": 9,
                "serviceName": "Network Connections",
                "operations": [{
                    "operationId": 9,
                    "operationName": "Options"
                }, {
                    "operationId": 10,
                    "operationName": "Get"
                }, {
                    "operationId": 11,
                    "operationName": "Head"
                }]
            }]
        },

        {
            "hostId": 777,
            "hostName": "SomeCommonHostName",
            "services": [{
                "serviceId": 0,
                "serviceName": "Device",
                "operations": [{
                    "operationId": 0,
                    "operationName": "DeviceInfo"
                }, {
                    "operationId": 1,
                    "operationName": "DeviceRestart"
                }, {
                    "operationId": 2,
                    "operationName": "DeviceUpdate"
                }]
            }, {
                "serviceId": 1,
                "serviceName": "CommonServiceName",
                "operations": [{
                    "operationId": 3,
                    "operationName": "Update"
                }, {
                    "operationId": 4,
                    "operationName": "Refresh"
                }, {
                    "operationId": 5,
                    "operationName": "CommonOperationName"
                }]
            }]
        },

    ]
};

// ================================================================================
//                             Search for service /w hostId
// ================================================================================
var result = search({
    hostId: 0,
    mode: 'services',
    keyword: 'SilverBack.dev'
});

console.log(result);
// ================================================================================
//                             Search for service without id
// ================================================================================
var result = search({
    mode: 'services',
    keyword: 'SilverBack.dev'
});

console.log(result);
// ================================================================================
//                             Search for operation /w hostId & serviceId
// ================================================================================
var result = search({
    hostId: 777,
    serviceId: 1,
    mode: 'operations',
    keyword: 'SomeCommonHostName.CommonServiceName.common'
});

console.log(result);
// ================================================================================
//                             Search for operation /w hostId
// ================================================================================
var result = search({
    hostId: 777,
    mode: 'operations',
    keyword: 'SomeCommonHostName.CommonServiceName.common'
});

console.log(result);
// ================================================================================
//                             Search for operation /w hostId
// ================================================================================
var result = search({
    serviceId: 1,
    mode: 'operations',
    keyword: 'SomeCommonHostName.CommonServiceName.common'
});

console.log(result);
// ================================================================================
//                             Search for operation without ids
// ================================================================================
var result = search({
    mode: 'operations',
    keyword: 'SomeCommonHostName.CommonServiceName.common'
});

console.log(result);
// ================================================================================

function search(options) {
    var hostId    = options.hostId;
    var serviceId = options.serviceId;
    var keyword   = options.keyword;
    var mode      = options.mode;

    var pathSections = keyword.split('.');

    var hostName = pathSections[0];
    var serviceName = pathSections[1];
    var operationName = pathSections[2];

    if (mode === 'services') {
        return searchForService(hostId, hostName, serviceName);
    }

    if (mode === 'operations') {
        return searchForOperation(hostId, hostName, serviceId, serviceName, operationName);
    }

}

function searchForService(hostId, hostName, serviceName) {
    var host = getHost(hostId, hostName);

    return host.services.filter(function filterServices(service) {
        return ~service.serviceName.toLowerCase().indexOf(serviceName);
    }).map(function mapServices(service) {
        return {
            serviceId: service.serviceId,
            serviceName: service.serviceName
        };
    });

}

function searchForOperation(hostId, hostName, serviceId, serviceName, operationName) {
    var host    = getHost(hostId, hostName);
    var service = getService(host, serviceId, serviceName);

    return service.operations.filter(function filterOperations(operation) {
        return ~operation.operationName.toLowerCase().indexOf(operationName);
    });
}

// ================================================================================
//                           BY ID FILTERING
// ================================================================================
function getHostById(hostId) {
    return data.hosts.filter(function filterHosts(host) {
        return host.hostId === hostId;
    })[0];
}

function getServiceById(host, serviceId) {
        return host.services.filter(function filterServices(service) {
            return service.serviceId === serviceId;
        })[0];
}
// ================================================================================
//                           BY NAME FILTERING
// ================================================================================
function getHostByName(hostName) {
    return data.hosts.filter(function filterHosts(host) {
        return host.hostName.toLowerCase() === hostName.toLowerCase();
    })[0];
}

function getServiceByName(host, serviceName) {
    return host.services.filter(function filterServices(service) {
        return service.serviceName.toLowerCase() === serviceName.toLowerCase();
    })[0];
}
// ================================================================================
function getHost(hostId, hostName) {
    if (hostId != undefined) {
        var host = getHostById(hostId);
    } else {
        var host = getHostByName(hostName);
    }

    return host;
}

function getService(host, serviceId, serviceName) {
    if (serviceId != undefined) {
        var service = getServiceById(host, serviceId);
    } else {
        var service = getServiceByName(host, serviceName);
    }

    return service;
}

// ================================================================================

function getHosts(keyword) {
    return data
        .hosts
        .filter(function filterHosts(host) {
            return ~host.hostName.toLowerCase().indexOf(keyword);
        }).map(function mapHosts(host) {
            return {
                hostId: host.hostId,
                hostName: host.hostName
            };
        })
}

function getServices(keyword) {
    return data
        .hosts
        .map(function mapHosts(host) {
            return host.services.filter(function filterServices(service) {
                return ~service.serviceName.toLowerCase().indexOf(keyword);
            })
        }).concatAll().map(function mapServices(service) {
            return {
                serviceId: service.serviceId,
                serviceName: service.serviceName
            };
        })
}

function getOperations(keyword) {
    return data
        .hosts
        .map(function mapHosts(host) {
            return host.services.map(function mapServices(service) {
                return service.operations.filter(function filterOperations(operation) {
                    return ~operation.operationName.toLowerCase().indexOf(keyword);
                })
            }).concatAll()
        }).concatAll();
}
