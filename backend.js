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
            "id": 0,
            "hostName": "SilverBack",
            "services": [{
                "id": 0,
                "serviceName": "Device",
                "operations": [{
                    "id": 0,
                    "operationName": "DeviceInfo"
                }, {
                    "id": 1,
                    "operationName": "DeviceRestart"
                }, {
                    "id": 2,
                    "operationName": "DeviceUpdate"
                }]
            }, {
                "id": 1,
                "serviceName": "ApplicationManagement",
                "operations": [{
                    "id": 3,
                    "operationName": "Update"
                }, {
                    "id": 4,
                    "operationName": "Refresh"
                }, {
                    "id": 5,
                    "operationName": "Reload"
                }]
            }]
        },

        {
            "id": 1,
            "hostName": "DevEnvironment",
            "services": [{
                "id": 2,
                "serviceName": "CoreMessaging",
                "operations": [{
                    "id": 6,
                    "operationName": "Create"
                }, {
                    "id": 7,
                    "operationName": "Read"
                }, {
                    "id": 8,
                    "operationName": "Delete"
                }]
            }, {
                "id": 3,
                "serviceName": "History",
                "operations": [{
                    "id": 9,
                    "operationName": "Options"
                }, {
                    "id": 10,
                    "operationName": "Get"
                }, {
                    "id": 11,
                    "operationName": "Head"
                }]
            }]
        },

        {
            "id": 2,
            "hostName": "ProductionEnvironment",
            "services": [{
                "id": 4,
                "serviceName": "Queue",
                "operations": [{
                    "id": 12,
                    "operationName": "Trace"
                }, {
                    "id": 13,
                    "operationName": "Put"
                }, {
                    "id": 14,
                    "operationName": "Connect"
                }]
            }, {
                "id": 5,
                "serviceName": "Network",
                "operations": [{
                    "id": 15,
                    "operationName": "Fetch"
                }, {
                    "id": 16,
                    "operationName": "Pull"

                }, {
                    "id": 17,
                    "operationName": "Push"
                }]
            }]
        },

        {
            "id": 3,
            "hostName": "TestingEnvironment",
            "services": [{
                "id": 6,
                "serviceName": "DeviceInstallService",
                "operations": [{
                    "id": 18,
                    "operationName": "Fetch"
                }, {
                    "id": 19,
                    "operationName": "Pull"

                }, {
                    "id": 20,
                    "operationName": "Push"
                }]
            }, {
                "id": 7,
                "serviceName": "EnterpriseAppManagementService",
                "operations": [{
                    "id": 21,
                    "operationName": "DeviceInfo"
                }, {
                    "id": 22,
                    "operationName": "DeviceRestart"
                }, {
                    "id": 23,
                    "operationName": "DeviceUpdate"
                }]
            }]
        },

        {
            "id": 4,
            "hostName": "StagingEnvironment",
            "services": [{
                "id": 8,
                "serviceName": "FunctionDiscoveryProviderHost",
                "operations": [{
                    "id": 3,
                    "operationName": "Update"
                }, {
                    "id": 4,
                    "operationName": "Refresh"
                }, {
                    "id": 5,
                    "operationName": "Reload"
                }]
            }, {
                "id": 9,
                "serviceName": "NetworkConnections",
                "operations": [{
                    "id": 9,
                    "operationName": "Options"
                }, {
                    "id": 10,
                    "operationName": "Get"
                }, {
                    "id": 11,
                    "operationName": "Head"
                }]
            }]
        },

        {
            "id": 777,
            "hostName": "SomeCommonHostName",
            "services": [{
                "id": 0,
                "serviceName": "Device",
                "operations": [{
                    "id": 0,
                    "operationName": "DeviceInfo"
                }, {
                    "id": 1,
                    "operationName": "DeviceRestart"
                }, {
                    "id": 2,
                    "operationName": "DeviceUpdate"
                }]
            }, {
                "id": 1,
                "serviceName": "CommonServiceName",
                "operations": [{
                    "id": 3,
                    "operationName": "Update"
                }, {
                    "id": 4,
                    "operationName": "Refresh"
                }, {
                    "id": 5,
                    "operationName": "CommonOperationName"
                }]
            }]
        },

    ]
};

// ================================================================================
//                             Search for service /w id
// ================================================================================
// var result = search({
//     hostId: 0,
//     mode: 'services',
//     keyword: 'SilverBack.dev'
// });
//
// console.log(result);
// ================================================================================
//                             Search for service without id
// ================================================================================
// var result = search({
//     mode: 'services',
//     keyword: 'SilverBack.dev'
// });
//
// console.log(result);
// ================================================================================
//                             Search for operation /w id & id
// ================================================================================
// var result = search({
//     hostId: 777,
//     serviceId: 1,
//     mode: 'operations',
//     keyword: 'SomeCommonHostName.CommonServiceName.common'
// });
//
// console.log(result);
// // ================================================================================
//                             Search for operation /w id
// ================================================================================
// var result = search({
//     hostId: 777,
//     mode: 'operations',
//     keyword: 'SomeCommonHostName.CommonServiceName.common'
// });
//
// console.log(result);
// ================================================================================
//                             Search for operation /w id
// ================================================================================
// var result = search({
//     serviceId: 1,
//     mode: 'operations',
//     keyword: 'SomeCommonHostName.CommonServiceName.common'
// });
//
// console.log(result);
// ================================================================================
//                             Search for operation without ids
// ================================================================================
// var result = search({
//     mode: 'operations',
//     keyword: 'SomeCommonHostName.CommonServiceName.common'
// });
//
// console.log(result);
// ================================================================================

function search(options) {
    var hostId = options.hostId;
    var serviceId = options.serviceId;

    try {
        var keyword = options.keyword.trim();
    } catch (e) {}

    var mode = options.mode;

    try {
        var pathSections = keyword.split('.');
    } catch (e) {}

    if (!keyword) {
        return {
            hosts: getHosts()
        };
    }

    var hostName      = pathSections[0];
    var serviceName   = pathSections[1];
    var operationName = pathSections[2];

    if (!serviceName && !operationName && serviceName !== '' && operationName !== '') {
        var hosts      = getHosts(keyword);
        var services   = getServices(keyword);
        var operations = getOperations(keyword);
        var results    = {};

        if (hosts.length)      results.hosts      = hosts;
        if (services.length)   results.services   = services;
        if (operations.length) results.operations = operations;

        if (!Object.keys(results).length) return [];

        return results;
    }

    if (mode === 'services') {
        var services = searchForService(hostId, hostName, serviceId, serviceName);
        return {
            services: services
        };
    }

    if (mode === 'operations') {
        if (!operationName && operationName !== '') {
            var services = searchForService(hostId, hostName, serviceId, serviceName);
            return {
                services: services
            };
        }

        var operations = searchForOperation(hostId, hostName, serviceId, serviceName, operationName);
        return {
            operations: operations
        };
    }

}

function searchForService(hostId, hostName, serviceId, serviceName) {
    var host = getHost(hostId, hostName);

    if (serviceId) {
        var service = getServiceById(host, serviceId)

        return {
            services: [{
                id: service.id,
                shortName: service.serviceName,
                name: host.hostName + '.' + service.serviceName,
                type: 'service'
            }]
        };

    }

    return host.services.filter(function filterServices(service) {
        return ~service.serviceName.toLowerCase().indexOf(serviceName.toLowerCase());
    }).map(function mapServices(service) {
        return {
            id: service.id,
            shortName: service.serviceName,
            name: host.hostName + '.' + service.serviceName,
            type: 'service'
        };
    });
}

function searchForOperation(hostId, hostName, serviceId, serviceName, operationName) {
    var host = getHost(hostId, hostName);
    var service = getService(host, serviceId, serviceName);

    return service.operations.filter(function filterOperations(operation) {
        return ~operation.operationName.toLowerCase().indexOf(operationName.toLowerCase());
    }).map(function mapOperations(operation) {
        return {
            id: operation.id,
            shortName: operation.operationName,
            name: host.hostName + '.' + service.serviceName + '.' + operation.operationName,
            type: 'operation'
        };
    });
}

// ================================================================================
//                           BY ID FILTERING
// ================================================================================
function getHostById(id) {
    return data.hosts.filter(function filterHosts(host) {
        return host.id == id;
    })[0];
}

function getServiceById(host, id) {
    return host.services.filter(function filterServices(service) {
        return service.id == id;
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
function getHost(id, hostName) {
    if (typeof id !== 'undefined') {
        var host = getHostById(id);
    } else {
        var host = getHostByName(hostName);
    }

    return host;
}

function getService(host, id, serviceName) {
    if (typeof id !== 'undefined') {
        var service = getServiceById(host, id);
    } else {
        var service = getServiceByName(host, serviceName);
    }

    return service;
}

// ================================================================================

function getHosts(keyword) {
    if (!keyword) {
        keyword = '';
    }

    return data
        .hosts
        .filter(function filterHosts(host) {
            return ~host.hostName.toLowerCase().indexOf(keyword.toLowerCase());
        }).map(function mapHosts(host) {
            return {
                id: host.id,
                type: 'host',
                shortName: host.hostName,
                name: host.hostName
            };
        })
}

function getServices(keyword) {
    return data
        .hosts
        .map(function mapHosts(host) {
            return host.services.filter(function filterServices(service) {
                return ~service.serviceName.toLowerCase().indexOf(keyword.toLowerCase());
            }).map(function mapServices(service) {
                return {
                    id: service.id,
                    type: 'service',
                    shortName: service.serviceName,
                    name: host.hostName + '.' + service.serviceName
                };
            })
        }).concatAll()
}

function getOperations(keyword) {
    return data
        .hosts
        .map(function mapHosts(host) {
            return host.services.map(function mapServices(service) {
                return service.operations.filter(function filterOperations(operation) {
                    return ~operation.operationName.toLowerCase().indexOf(keyword.toLowerCase());
                }).map(function mapOperations(operation) {
                    return {
                        id: operation.id,
                        type: 'operation',
                        name: host.hostName + '.' + service.serviceName + '.' + operation.operationName,
                        shortName: operation.operationName
                    }
                })
            }).concatAll()
        }).concatAll();
}
