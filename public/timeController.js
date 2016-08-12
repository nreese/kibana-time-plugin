define(function (require) {
  var moment = require('moment');
  var dateMath = require('ui/utils/dateMath');
  var module = require('ui/modules').get('kibana/kibana-time-plugin');
  var _ = require('lodash');
  require('ui/timepicker/quick_ranges');
  
  module.controller('KbnTimeVisController', function (quickRanges, $scope, $rootScope, Private, $filter) {
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

    $scope.quickLists = quickRanges;

    function setTime(rangeA, rangeB) {
      $scope.time = {
        from: dateMath.parse(rangeA[0]),
        to: dateMath.parse(rangeA[1], true)
      }
      if('quick' === $rootScope.$$timefilter.time.mode) {
        deactivateAllSlides();
        $scope.activeSlide.quick = true;
        for(var i=0; i<quickRanges.length; i++) {
          if(quickRanges[i].from === rangeA[0] && quickRanges[i].to === rangeA[1]) {
            $scope.selectedQuick = quickRanges[i];
            $scope.time.title = quickRanges[i].display;
            break;
          }
        }
      } else if ('relative' === $rootScope.$$timefilter.time.mode) {
        deactivateAllSlides();
        $scope.activeSlide.relative = true;
        $scope.time.title = "";
      } else {
        deactivateAllSlides();
        $scope.activeSlide.absolute = true;
        $scope.time.title = "";
      }
    }

    function deactivateAllSlides() {
      $scope.activeSlide = {
        absolute: false,
        quick: false,
        relative: false
      };
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

    $scope.setQuick = function (selectedQuick) {
      $scope.absoluteActive = true;
      $rootScope.$$timefilter.time.mode = 'quick';
      $rootScope.$$timefilter.time.from = selectedQuick.from;
      $rootScope.$$timefilter.time.to = selectedQuick.to;
      $scope.time.title = selectedQuick.display;
    };

    $scope.$watch('vis.params.title', function (title) {
      $scope.config.title = title;
    });
  });
});
