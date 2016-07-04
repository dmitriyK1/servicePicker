(function(w) {

    'use strict';

    angular
        .module('app')
        .controller('MxServicePickerCtrl', MxServicePickerCtrl)

    function MxServicePickerCtrl($log) {
        var vm = this;

        vm.$log = $log;

        console.log('MxServicePickerCtrl initialized');
    }

})(window);
