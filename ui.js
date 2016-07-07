$('#submit').click(function onClick(e) {

    var keyword   = $('#keyword').val();
    var hostId    = $('#hostId').val();
    var serviceId = $('#serviceId').val();
    var mode      = $('input[name="mode"]:checked').val();

    if (mode === 'service') {
        if (hostId) searchInHost(hostId, keyword);
    }

    if (mode === 'operation') {

    }

});









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
