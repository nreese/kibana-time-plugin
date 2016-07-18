define(function (require) {
  var moment = require('moment');
  var dateMath = require('ui/utils/dateMath');
  var module = require('ui/modules').get('kibana/kibana-time-plugin');
  module.controller('KbnTimeVisController', function ($scope, $rootScope, Private, $filter) {
    $rootScope.plugin = {
      timePlugin: {}
    };
    $scope.config = {
        title: ""
    };

    $rootScope.$watchMulti([
      '$$timefilter.time.from',
      '$$timefilter.time.to'
    ], setTime);

    function setTime(rangeA, rangeB) {
      $scope.time = {
        from: dateMath.parse(rangeA[0]),
        to: dateMath.parse(rangeA[1], true)
      }
    }

    setTime([$rootScope.$$timefilter.time.from, $rootScope.$$timefilter.time.to]);

    $scope.updateKbnTime = function() {
      $rootScope.$$timefilter.time.from = $scope.time.from;
      $rootScope.$$timefilter.time.to = $scope.time.to;
      $rootScope.$$timefilter.time.mode = 'absolute';
    };

    $scope.startOfDay = function() {
      $scope.time.to.startOf('day')
    }

    $scope.$watch('vis.params.title', function (title) {
      $scope.config.title = title;
    });
  });
});
