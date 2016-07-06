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

// var result = search('environment', 'hosts');
// console.log('Hosts:');
// console.dir(result);
//
// var result = search('network', 'services');
// console.log('Services:');
// console.dir(result);
//
// var result = search('refresh', 'operations');
// console.log('Operations:');
// console.dir(result);

// var searchOptions = {
//     keyword: 'common'
// };

// var result = search(searchOptions);
// console.dir(result);

// { hosts: [{ hostName, hostId }], services: [{ servicePath:
// hostName.serviceName, serviceId }], operations: [{ operationPath:
// hostName.serviceName.operationName, operationId }] }

// var result = getHostById(3);
// console.dir(result);

// var result = getServiceById(1);
// console.dir(result);

// var result = search({ hostId: 777, mode: 'services', keyword: 'common' });
// console.log(result);

var result = search({ hostId: 777, serviceId: 1, mode: 'operations', keyword: 'common' });
console.log(result);

function search(options) {

    var hostId = options.hostId;
    var serviceId = options.serviceId;
    var keyword = options.keyword;
    var mode = options.mode;

    if (!mode) {
        return {
            hosts: getHosts(keyword),
            services: getServices(keyword),
            operations: getOperations(keyword)
        };
    }

    if (mode === 'services') {
        if (hostId) return searchInHost(hostId, keyword);

        return getServices(keyword);
    }

    if (mode === 'operations') {
        if (serviceId) return searchInService(hostId, serviceId, keyword);

        return getOperations(keyword);
    }

}

function searchInHost(hostId, keyword) {
    return getHostById(hostId).services.filter(function filterServices(service) {
        return ~service.serviceName.toLowerCase().indexOf(keyword);
    }).map(function mapServices(service) {
        return {
            serviceId: service.serviceId,
            serviceName: service.serviceName
        };
    });
}

function searchInService(hostId, serviceId, keyword) {
    return getHostById(hostId).services.filter(function filterServices(service) {
        return ~service.serviceName.toLowerCase().indexOf(keyword);
    }).map(function mapServices(service) {
        return service.operations.filter(function filterOperations(operation) {
            return ~operation.operationName.toLowerCase().indexOf(keyword);
        });
    }).concatAll();
}

// ================================================================================
//                           BY ID FILTERING
// ================================================================================
function getHostById(id) {
    return data.hosts.filter(function filterHosts(host) {
        return host.hostId === id;
    })[0];
}

// search in all hosts
function getServiceById(id) {
    return data.hosts.map(function mapHosts(host) {
        return host.services.filter(function filterServices(service) {
            return service.serviceId === id;
        })
    }).concatAll();
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
