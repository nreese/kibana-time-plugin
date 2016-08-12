define(function (require) {
  var moment = require('moment');
  var dateMath = require('ui/utils/dateMath');
  var module = require('ui/modules').get('kibana/kibana-time-plugin');
  var _ = require('lodash');
  require('ui/timepicker/quick_ranges');
  require('ui/timepicker/time_units');
  
  module.controller('KbnTimeVisController', function (quickRanges, timeUnits, $scope, $rootScope, Private, $filter) {
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
    $scope.units = timeUnits;
    $scope.relativeOptions = [
      {text: 'Seconds ago', value: 's'},
      {text: 'Minutes ago', value: 'm'},
      {text: 'Hours ago', value: 'h'},
      {text: 'Days ago', value: 'd'},
      {text: 'Weeks ago', value: 'w'},
      {text: 'Months ago', value: 'M'},
      {text: 'Years ago', value: 'y'},
    ];
    $scope.relative = {
      count: 1,
      unit: 'm',
      preview: undefined,
      round: false
    };

    function setTime(rangeA, rangeB) {
      //clean up old selections
      $scope.activeSlide = {
        absolute: false,
        quick: false,
        relative: false
      };
      $scope.selectedQuick = null;

      //set new selections based on new time
      var from = rangeA[0];
      var to = rangeA[1];
      $scope.time = {
        from: dateMath.parse(from),
        to: dateMath.parse(to, true)
      }
      setRelativeParts(to, from);
      if('quick' === $rootScope.$$timefilter.time.mode) {
        $scope.activeSlide.quick = true;
        for(var i=0; i<quickRanges.length; i++) {
          if(quickRanges[i].from === from && quickRanges[i].to === to) {
            $scope.selectedQuick = quickRanges[i];
            $scope.time.title = quickRanges[i].display;
            break;
          }
        }
      } else if ('relative' === $rootScope.$$timefilter.time.mode) {
        $scope.activeSlide.relative = true;
        $scope.time.title = "";
      } else {
        $scope.activeSlide.absolute = true;
        $scope.time.title = "";
      }
    }

    setTime([$rootScope.$$timefilter.time.from, $rootScope.$$timefilter.time.to]);

    $scope.setAbsolute = function() {
      $rootScope.$$timefilter.time.from = $scope.time.from;
      $rootScope.$$timefilter.time.to = $scope.time.to;
      $rootScope.$$timefilter.time.mode = 'absolute';
    };

    $scope.setRelative = function () {
      $rootScope.$$timefilter.time.from = getRelativeString();
      $rootScope.$$timefilter.time.to = 'now';
      $rootScope.$$timefilter.time.mode = 'relative';
    };

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

    //Relative date logic copied from https://github.com/elastic/kibana/blob/4.4/src/ui/public/timepicker/timepicker.js

    //convert to and from into pieces needed for relative inputs
    function setRelativeParts(to, from) {
      var fromParts = from.toString().split('-');
      var relativeParts = [];

      // Try to parse the relative time, if we can't use moment duration to guestimate
      if (to.toString() === 'now' && fromParts[0] === 'now' && fromParts[1]) {
        relativeParts = fromParts[1].match(/([0-9]+)([smhdwMy]).*/);
      }
      if (relativeParts[1] && relativeParts[2]) {
        $scope.relative.count = parseInt(relativeParts[1], 10);
        $scope.relative.unit = relativeParts[2];
      } else {
        var duration = moment.duration(moment().diff(dateMath.parse(from)));
        var units = _.pluck(_.clone($scope.relativeOptions).reverse(), 'value');
        if (from.toString().split('/')[1]) $scope.relative.round = true;
        for (var i = 0; i < units.length; i++) {
          var as = duration.as(units[i]);
          if (as > 1) {
            $scope.relative.count = Math.round(as);
            $scope.relative.unit = units[i];
            break;
          }
        }
      }

      if (from.toString().split('/')[1]) $scope.relative.round = true;
      formatRelative();
    }
    function formatRelative() {
      var parsed = dateMath.parse(getRelativeString());
      $scope.relative.preview =  parsed ? parsed.format($scope.format) : undefined;
      return parsed;
    }
    $scope.formatRelative = formatRelative;

    function getRelativeString() {
      return 'now-' + $scope.relative.count + $scope.relative.unit + ($scope.relative.round ? '/' + $scope.relative.unit : '');
    }
  });
});
